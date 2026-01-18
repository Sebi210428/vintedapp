import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { sniffImageMime } from "@/lib/imageSniff";
import { logEvent, newRequestId } from "@/lib/log";
import { base64SizeBytes, safeEqualSecret } from "@/lib/security";
import { writeOutputFile } from "@/lib/storage";

export const runtime = "nodejs";

type CallbackPayload = {
  jobId?: string;
  ok?: boolean;
  error?: string;
  outputBase64?: string;
  outputMime?: string;
};

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    const secret = request.headers.get("x-worker-secret") ?? "";
    const expected = process.env.WORKER_SHARED_SECRET ?? "";
    if (!safeEqualSecret(secret, expected)) {
      logEvent("warn", "jobs.callback.unauthorized", { requestId });
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = (await request.json().catch(() => null)) as CallbackPayload | null;
    const jobId = typeof payload?.jobId === "string" ? payload.jobId : "";
    const ok = payload?.ok === true;

    if (!jobId) {
      return NextResponse.json({ ok: false, error: "Missing jobId" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, status: true, creditsCost: true, userId: true },
    });
    if (!job) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (job.status === "done" || job.status === "failed") {
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    if (!ok) {
      const message =
        typeof payload?.error === "string" && payload.error.trim().length
          ? payload.error.trim().slice(0, 500)
          : "Processing failed";

      await prisma.$transaction(async (tx) => {
        const updated = await tx.job.update({
          where: { id: jobId },
          data: { status: "failed", error: message },
          select: { creditsCost: true, userId: true },
        });
        await tx.user.update({
          where: { id: updated.userId },
          data: { credits: { increment: updated.creditsCost } },
          select: { id: true },
        });
      });

      logEvent("info", "jobs.callback.failed", {
        requestId,
        jobId,
        userId: job.userId,
        refundedCredits: job.creditsCost,
      });
      return NextResponse.json({ ok: true }, { status: 200 });
    }

    const outputBase64 = typeof payload?.outputBase64 === "string" ? payload.outputBase64 : "";
    if (!outputBase64.length) {
      return NextResponse.json(
        { ok: false, error: "Missing outputBase64" },
        { status: 400 },
      );
    }

    const maxOutputMb = Number(process.env.MAX_OUTPUT_MB ?? "15");
    const maxBytes =
      Number.isFinite(maxOutputMb) && maxOutputMb > 0
        ? Math.floor(maxOutputMb * 1024 * 1024)
        : 15 * 1024 * 1024;
    const estimatedBytes = base64SizeBytes(outputBase64);
    if (estimatedBytes > maxBytes) {
      return NextResponse.json({ ok: false, error: "Output too large" }, { status: 413 });
    }

    const buffer = Buffer.from(outputBase64, "base64");
    const sniffedMime = sniffImageMime(buffer);
    if (!sniffedMime) {
      return NextResponse.json({ ok: false, error: "Unsupported output type" }, { status: 400 });
    }

    const out = await writeOutputFile({ jobId, mime: sniffedMime, buffer });

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "done",
        error: null,
        outputKey: out.key,
        outputMime: out.mime,
        outputSize: out.size,
      },
      select: { id: true },
    });

    logEvent("info", "jobs.callback.done", {
      requestId,
      jobId,
      userId: job.userId,
      outputMime: out.mime,
      outputSize: out.size,
    });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    logEvent("error", "jobs.callback.unhandled", { requestId });
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
