import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { getClientIpFromHeaders } from "@/lib/loginRateLimit";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";
import { enforceSameOrigin } from "@/lib/security";

type PreferencesPayload = {
  preferredLanguage?: string;
  timezone?: string;
  outputFormat?: string;
  defaultQuality?: number;
  allowUsageData?: boolean;
  publicProfile?: boolean;
};

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(value)));
}

export async function GET() {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      preferredLanguage: true,
      timezone: true,
      outputFormat: true,
      defaultQuality: true,
      allowUsageData: true,
      publicProfile: true,
      notifyProductUpdates: true,
      notifySecurityAlerts: true,
    },
  });

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ ok: true, preferences: user }, { status: 200 });
}

export async function POST(request: NextRequest) {
  try {
    enforceSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const clientIp = getClientIpFromHeaders(Object.fromEntries(request.headers.entries()));
  if (clientIp) {
    recordRateLimitHit(`account-preferences-ip|${clientIp}`, {
      maxHits: 40,
      windowMs: 10 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });
    const ipStatus = getRateLimitStatus(`account-preferences-ip|${clientIp}`, {
      maxHits: 40,
      windowMs: 10 * 60 * 1000,
      blockMs: 10 * 60 * 1000,
    });
    if (!ipStatus.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "retry-after": String(ipStatus.retryAfterSeconds) } },
      );
    }
  }

  recordRateLimitHit(`account-preferences-email|${email}`, {
    maxHits: 30,
    windowMs: 10 * 60 * 1000,
    blockMs: 10 * 60 * 1000,
  });
  const emailStatus = getRateLimitStatus(`account-preferences-email|${email}`, {
    maxHits: 30,
    windowMs: 10 * 60 * 1000,
    blockMs: 10 * 60 * 1000,
  });
  if (!emailStatus.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "retry-after": String(emailStatus.retryAfterSeconds) } },
    );
  }

  const payload = (await request.json().catch(() => null)) as PreferencesPayload | null;
  if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const updateData: Record<string, unknown> = {};

  if (typeof payload.preferredLanguage === "string") {
    updateData.preferredLanguage = payload.preferredLanguage.slice(0, 10);
  }
  if (typeof payload.timezone === "string") {
    updateData.timezone = payload.timezone.slice(0, 64);
  }
  if (typeof payload.outputFormat === "string") {
    const format = payload.outputFormat.toUpperCase();
    if (!["PNG", "JPG", "WEBP"].includes(format)) {
      return NextResponse.json({ error: "Invalid output format." }, { status: 400 });
    }
    updateData.outputFormat = format;
  }
  if (typeof payload.defaultQuality === "number" && Number.isFinite(payload.defaultQuality)) {
    updateData.defaultQuality = clampInt(payload.defaultQuality, 10, 100);
  }
  if (typeof payload.allowUsageData === "boolean") {
    updateData.allowUsageData = payload.allowUsageData;
  }
  if (typeof payload.publicProfile === "boolean") {
    updateData.publicProfile = payload.publicProfile;
  }

  await prisma.user.update({
    where: { email },
    data: updateData,
    select: { id: true },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
