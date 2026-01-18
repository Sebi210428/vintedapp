import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { getJobCreditsCost, getMaxUploadBytes, isImageMime, newJobId } from "@/lib/jobs";
import { sniffImageMime } from "@/lib/imageSniff";
import { getClientIpFromHeaders } from "@/lib/loginRateLimit";
import { logEvent, newRequestId } from "@/lib/log";
import { getMonthRange, getMonthlyIncludedJobs } from "@/lib/quota";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";
import { enforceSameOrigin } from "@/lib/security";
import { writeInputFile, writeOutputFile } from "@/lib/storage";

export const runtime = "nodejs";

function jsonError(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET() {
  try {
    const session = await getServerAuthSession();
    const email = session?.user?.email?.toLowerCase() ?? null;
    if (!email) return jsonError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });
    if (!user) return jsonError("Unauthorized", 401);

    const jobs = await prisma.job.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
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

    return NextResponse.json({ ok: true, jobs }, { status: 200 });
  } catch {
    return jsonError("Server error", 500);
  }
}

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    enforceSameOrigin(request);

    const session = await getServerAuthSession();
    const email = session?.user?.email?.toLowerCase() ?? null;
    if (!email) return jsonError("Unauthorized", 401);

    const clientIp = getClientIpFromHeaders(Object.fromEntries(request.headers.entries()));
    if (clientIp) {
      recordRateLimitHit(`jobs-create-ip|${clientIp}`, {
        maxHits: 30,
        windowMs: 10 * 60 * 1000,
        blockMs: 15 * 60 * 1000,
      });
      const ipStatus = getRateLimitStatus(`jobs-create-ip|${clientIp}`, {
        maxHits: 30,
        windowMs: 10 * 60 * 1000,
        blockMs: 15 * 60 * 1000,
      });
      if (!ipStatus.allowed) {
        return NextResponse.json(
          { ok: false, error: "Too many uploads. Try again later." },
          { status: 429, headers: { "retry-after": String(ipStatus.retryAfterSeconds) } },
        );
      }
    }

    const formData = await request.formData().catch(() => null);
    if (!formData) return jsonError("Invalid form data", 400);

    const rawFile = formData.get("file");
    if (!(rawFile instanceof File)) return jsonError("Missing file", 400);

    const maxBytes = getMaxUploadBytes();
    if (rawFile.size <= 0) return jsonError("Empty file", 400);
    if (rawFile.size > maxBytes) return jsonError("File too large", 413);

    const claimedMime = rawFile.type || "application/octet-stream";
    if (!isImageMime(claimedMime)) {
      return jsonError("Unsupported file type. Use PNG, JPG, or WEBP.", 400);
    }

    const inputBuffer = Buffer.from(await rawFile.arrayBuffer());
    const sniffedMime = sniffImageMime(inputBuffer);
    if (!sniffedMime) {
      return jsonError("Unsupported file content. Use PNG, JPG, or WEBP.", 400);
    }
    if (!isImageMime(sniffedMime)) {
      return jsonError("Unsupported file type. Use PNG, JPG, or WEBP.", 400);
    }

    const cost = getJobCreditsCost();
    const jobId = newJobId();
    const includedPerMonth = getMonthlyIncludedJobs();

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        credits: true,
        outputFormat: true,
        defaultQuality: true,
      },
    });
    if (!user) return jsonError("Unauthorized", 401);

    logEvent("info", "jobs.create.start", { requestId, userId: user.id });

    recordRateLimitHit(`jobs-create-user|${user.id}`, {
      maxHits: 20,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    const userStatus = getRateLimitStatus(`jobs-create-user|${user.id}`, {
      maxHits: 20,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    if (!userStatus.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many uploads. Try again later." },
        { status: 429, headers: { "retry-after": String(userStatus.retryAfterSeconds) } },
      );
    }

    const { start: monthStart, end: monthEnd } = getMonthRange(new Date());
    const monthlyUsed = await prisma.job.count({
      where: { userId: user.id, createdAt: { gte: monthStart, lt: monthEnd } },
    });

    const withinIncluded = monthlyUsed < includedPerMonth;
    const effectiveCost = withinIncluded ? 0 : cost;

    if (!withinIncluded && user.credits < effectiveCost) {
      logEvent("info", "jobs.create.blocked_not_enough_credits", {
        requestId,
        userId: user.id,
        includedPerMonth,
        monthlyUsed,
        credits: user.credits,
        creditsRequired: effectiveCost,
      });
      return NextResponse.json(
        {
          ok: false,
          error: "Not enough credits.",
          errorCode: "NOT_ENOUGH_CREDITS",
          monthly: { included: includedPerMonth, used: monthlyUsed },
          creditsRequired: effectiveCost,
        },
        { status: 402 },
      );
    }

    const created = await prisma.$transaction(async (tx) => {
      const locked = await tx.user.findUnique({
        where: { id: user.id },
        select: { credits: true },
      });
      if (!locked) throw new Error("Unauthorized");
      if (!withinIncluded && locked.credits < effectiveCost) {
        return {
          ok: false as const,
          error: "Not enough credits.",
          errorCode: "NOT_ENOUGH_CREDITS",
        };
      }

      if (effectiveCost > 0) {
        await tx.user.update({
          where: { id: user.id },
          data: { credits: { decrement: effectiveCost } },
          select: { id: true },
        });
      }

      const job = await tx.job.create({
        data: {
          id: jobId,
          userId: user.id,
          status: "queued",
          creditsCost: effectiveCost,
          inputKey: "pending",
          inputOriginalName: rawFile.name || null,
          inputMime: sniffedMime,
          inputSize: rawFile.size,
          outputFormat: user.outputFormat || "PNG",
          quality: user.defaultQuality || 90,
        },
        select: { id: true },
      });

      return { ok: true as const, jobId: job.id };
    });

    if (!created.ok) {
      if (created.errorCode === "NOT_ENOUGH_CREDITS") {
        logEvent("info", "jobs.create.blocked_not_enough_credits_tx", {
          requestId,
          userId: user.id,
          includedPerMonth,
          monthlyUsed,
          credits: user.credits,
          creditsRequired: effectiveCost,
        });
        return NextResponse.json(
          {
            ok: false,
            error: created.error,
            errorCode: created.errorCode,
            monthly: { included: includedPerMonth, used: monthlyUsed },
            creditsRequired: effectiveCost,
          },
          { status: 402 },
        );
      }
      return jsonError(created.error, 402);
    }

    try {
      const input = await writeInputFile({ jobId, file: rawFile, buffer: inputBuffer });
      await prisma.job.update({
        where: { id: jobId },
        data: {
          inputKey: input.key,
          inputMime: input.mime,
          inputSize: input.size,
          inputOriginalName: input.originalName,
        },
        select: { id: true },
      });

      const workerUrl = process.env.WORKER_URL?.trim() || "";
      const isProd = process.env.NODE_ENV === "production";
      const mockEnabled =
        (process.env.MOCK_WORKER?.toLowerCase() === "true" || (!workerUrl && !isProd)) &&
        process.env.MOCK_WORKER?.toLowerCase() !== "false";

      if (mockEnabled) {
        const out = await writeOutputFile({
          jobId,
          mime: input.mime,
          buffer: inputBuffer,
        });
        await prisma.job.update({
          where: { id: jobId },
          data: {
            status: "done",
            outputKey: out.key,
            outputMime: out.mime,
            outputSize: out.size,
            error: null,
          },
          select: { id: true },
        });
        logEvent("info", "jobs.create.mock_done", {
          requestId,
          userId: user.id,
          jobId,
          creditsCost: effectiveCost,
          includedPerMonth,
          monthlyUsed,
        });
      } else {
        if (!workerUrl) {
          await prisma.job.update({
            where: { id: jobId },
            data: { status: "failed", error: "Worker not configured." },
            select: { id: true },
          });
          if (effectiveCost > 0) {
            await prisma.user.update({
              where: { id: user.id },
              data: { credits: { increment: effectiveCost } },
              select: { id: true },
            });
          }
          return NextResponse.json(
            { ok: false, error: "Worker not configured.", errorCode: "WORKER_NOT_CONFIGURED" },
            { status: 503 },
          );
        }

        await prisma.job.update({
          where: { id: jobId },
          data: { status: "processing" },
          select: { id: true },
        });

        logEvent("info", "jobs.create.sent_to_worker", {
          requestId,
          userId: user.id,
          jobId,
          workerUrl,
          creditsCost: effectiveCost,
          includedPerMonth,
          monthlyUsed,
        });

        const callbackUrl =
          `${process.env.APP_URL ?? "http://localhost:3000"}`.replace(/\/+$/, "") +
          "/api/jobs/callback";
        const secret = process.env.WORKER_SHARED_SECRET ?? "";
        void fetch(workerUrl.replace(/\/+$/, "") + "/start", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            jobId,
            inputUrl:
              `${process.env.APP_URL ?? "http://localhost:3000"}`.replace(/\/+$/, "") +
              `/api/jobs/${jobId}/input`,
            callbackUrl,
            outputFormat: user.outputFormat || "PNG",
            quality: user.defaultQuality || 90,
            workerSecret: secret,
          }),
        }).catch(() => null);
      }

      return NextResponse.json({ ok: true, jobId }, { status: 201 });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      logEvent("error", "jobs.create.failed_after_db", {
        requestId,
        userId: user.id,
        jobId,
        message,
      });
      await prisma.job.delete({ where: { id: jobId } }).catch(() =>
        prisma.job.update({
          where: { id: jobId },
          data: { status: "failed", error: message },
          select: { id: true },
        }),
      );
      if (effectiveCost > 0) {
        await prisma.user
          .update({
            where: { id: user.id },
            data: { credits: { increment: effectiveCost } },
            select: { id: true },
          })
          .catch(() => null);
      }
      return jsonError("Couldn't create job. Please try again.", 500);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "BadOrigin") return jsonError("Forbidden", 403);
    logEvent("error", "jobs.create.unhandled", { requestId, message });
    return jsonError("Server error", 500);
  }
}
