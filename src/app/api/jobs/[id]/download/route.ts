import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { logEvent, newRequestId } from "@/lib/log";
import { readStorageFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const requestId = newRequestId();
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await context.params;
  if (!id) return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });

  const job = await prisma.job.findFirst({
    where: { id, userId: user.id },
    select: { status: true, outputKey: true, outputMime: true },
  });
  if (!job) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  if (job.status !== "done" || !job.outputKey) {
    return NextResponse.json({ ok: false, error: "Not ready" }, { status: 409 });
  }

  const bytes = await readStorageFile(job.outputKey).catch(() => null);
  if (!bytes) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

  logEvent("info", "jobs.download", { requestId, userId: user.id, jobId: id });

  const contentType = job.outputMime || "application/octet-stream";
  const ext =
    contentType === "image/png" ? "png" : contentType === "image/webp" ? "webp" : "jpg";

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      "content-type": contentType,
      "content-disposition": `attachment; filename=\"result-${id}.${ext}\"`,
      "cache-control": "no-store",
    },
  });
}
