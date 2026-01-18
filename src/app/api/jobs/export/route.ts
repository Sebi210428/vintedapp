import { NextRequest, NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["queued", "processing", "done", "failed"]);

function escapeCsv(value: string) {
  if (value.includes('"') || value.includes(",") || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const statusRaw = request.nextUrl.searchParams.get("status") ?? "";
  const status = ALLOWED_STATUSES.has(statusRaw) ? statusRaw : "";

  const jobs = await prisma.job.findMany({
    where: {
      userId: user.id,
      ...(status ? { status } : null),
      ...(query
        ? {
            OR: [
              { id: { contains: query } },
              { error: { contains: query } },
              { status: { contains: query } },
            ],
          }
        : null),
    },
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
      inputOriginalName: true,
    },
  });

  const rows = [
    [
      "id",
      "status",
      "createdAt",
      "updatedAt",
      "creditsCost",
      "outputMime",
      "outputSize",
      "inputOriginalName",
      "error",
    ],
    ...jobs.map((job) => [
      job.id,
      job.status,
      job.createdAt.toISOString(),
      job.updatedAt.toISOString(),
      String(job.creditsCost),
      job.outputMime ?? "",
      job.outputSize ? String(job.outputSize) : "",
      job.inputOriginalName ?? "",
      job.error ?? "",
    ]),
  ];

  const csv = rows.map((row) => row.map((value) => escapeCsv(value)).join(",")).join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="jobs-export.csv"',
      "cache-control": "no-store",
    },
  });
}
