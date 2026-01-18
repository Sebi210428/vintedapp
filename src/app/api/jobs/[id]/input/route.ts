import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { safeEqualSecret } from "@/lib/security";
import { readStorageFile } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const secret = request.headers.get("x-worker-secret") ?? "";
    const expected = process.env.WORKER_SHARED_SECRET ?? "";
    if (!safeEqualSecret(secret, expected)) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ ok: false, error: "Invalid job id" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id },
      select: { inputKey: true, inputMime: true },
    });
    if (!job || !job.inputKey || job.inputKey === "pending") {
      return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    }

    const bytes = await readStorageFile(job.inputKey).catch(() => null);
    if (!bytes) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "content-type": job.inputMime || "application/octet-stream",
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
