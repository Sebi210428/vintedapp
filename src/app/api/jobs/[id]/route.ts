import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { logEvent, newRequestId } from "@/lib/log";
import { enforceSameOrigin } from "@/lib/security";
import { readStorageFile, writeOutputFile } from "@/lib/storage";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (!id) return jsonError("Invalid job id", 400);

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return jsonError("Unauthorized", 401);

  const job = await prisma.job.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      status: true,
      error: true,
      createdAt: true,
      updatedAt: true,
      outputMime: true,
      outputSize: true,
      creditsCost: true,
    },
  });

  if (!job) return jsonError("Not found", 404);
  return NextResponse.json({ ok: true, job }, { status: 200 });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = newRequestId();
  try {
    enforceSameOrigin(request);
  } catch {
    return jsonError("Forbidden", 403);
  }

  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) return jsonError("Unauthorized", 401);

  const { id } = await context.params;
  if (!id) return jsonError("Invalid job id", 400);

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, credits: true },
  });
  if (!user) return jsonError("Unauthorized", 401);

  const job = await prisma.job.findFirst({
    where: { id, userId: user.id },
    select: {
      id: true,
      status: true,
      error: true,
      creditsCost: true,
      inputKey: true,
      inputMime: true,
      outputFormat: true,
      quality: true,
    },
  });

  if (!job) return jsonError("Not found", 404);
  if (job.status !== "failed") return jsonError("Only failed jobs can be retried.", 409);
  if (!job.inputKey || job.inputKey === "pending") {
    return jsonError("Input file missing.", 409);
  }

  const workerUrl = process.env.WORKER_URL?.trim() || "";
  const isProd = process.env.NODE_ENV === "production";
  const mockEnabled =
    (process.env.MOCK_WORKER?.toLowerCase() === "true" || (!workerUrl && !isProd)) &&
    process.env.MOCK_WORKER?.toLowerCase() !== "false";
  if (!mockEnabled && !workerUrl) {
    return NextResponse.json(
      { ok: false, error: "Worker not configured.", errorCode: "WORKER_NOT_CONFIGURED" },
      { status: 503 },
    );
  }

  if (job.creditsCost > 0 && user.credits < job.creditsCost) {
    return NextResponse.json(
      {
        ok: false,
        error: "Not enough credits.",
        errorCode: "NOT_ENOUGH_CREDITS",
        creditsRequired: job.creditsCost,
      },
      { status: 402 },
    );
  }

  await prisma.$transaction(async (tx) => {
    if (job.creditsCost > 0) {
      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: job.creditsCost } },
        select: { id: true },
      });
    }
    await tx.job.update({
      where: { id },
      data: {
        status: mockEnabled ? "processing" : "processing",
        error: null,
        outputKey: null,
        outputMime: null,
        outputSize: null,
      },
      select: { id: true },
    });
  });

  if (mockEnabled) {
    const inputBytes = await readStorageFile(job.inputKey).catch(() => null);
    if (!inputBytes) {
      await prisma.job.update({
        where: { id },
        data: { status: "failed", error: "Input file missing." },
        select: { id: true },
      });
      if (job.creditsCost > 0) {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: { increment: job.creditsCost } },
          select: { id: true },
        });
      }
      return jsonError("Input file missing.", 409);
    }

    const out = await writeOutputFile({
      jobId: id,
      mime: job.inputMime || "image/png",
      buffer: inputBytes,
    });
    const updated = await prisma.job.update({
      where: { id },
      data: {
        status: "done",
        error: null,
        outputKey: out.key,
        outputMime: out.mime,
        outputSize: out.size,
      },
      select: {
        id: true,
        status: true,
        error: true,
        createdAt: true,
        outputMime: true,
        outputSize: true,
        creditsCost: true,
        inputOriginalName: true,
      },
    });

    logEvent("info", "jobs.retry.mock_done", { requestId, jobId: id, userId: user.id });
    return NextResponse.json(
      {
        ok: true,
        job: {
          ...updated,
          createdAt: updated.createdAt.toISOString(),
        },
      },
      { status: 200 },
    );
  }

  const callbackUrl =
    `${process.env.APP_URL ?? "http://localhost:3000"}`.replace(/\/+$/, "") +
    "/api/jobs/callback";
  const secret = process.env.WORKER_SHARED_SECRET ?? "";

  void fetch(workerUrl.replace(/\/+$/, "") + "/start", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      jobId: id,
      inputUrl:
        `${process.env.APP_URL ?? "http://localhost:3000"}`.replace(/\/+$/, "") +
        `/api/jobs/${id}/input`,
      callbackUrl,
      outputFormat: job.outputFormat || "PNG",
      quality: job.quality || 90,
      workerSecret: secret,
    }),
  }).catch(() => null);

  logEvent("info", "jobs.retry.sent_to_worker", { requestId, jobId: id, userId: user.id });

  const latest = await prisma.job.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      error: true,
      createdAt: true,
      outputMime: true,
      outputSize: true,
      creditsCost: true,
      inputOriginalName: true,
    },
  });

  return NextResponse.json(
    {
      ok: true,
      job: latest
        ? {
            ...latest,
            createdAt: latest.createdAt.toISOString(),
          }
        : null,
    },
    { status: 200 },
  );
}
