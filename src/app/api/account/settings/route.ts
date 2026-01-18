import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";
import { getClientIpFromHeaders } from "@/lib/loginRateLimit";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";
import { enforceSameOrigin, validatePassword } from "@/lib/security";

type Payload = {
  firstName?: string;
  lastName?: string;
  currentPassword?: string;
  newPassword?: string;
  notifyProductUpdates?: boolean;
  notifySecurityAlerts?: boolean;
};

function normalizeName(firstName: string, lastName: string) {
  const first = firstName.trim();
  const last = lastName.trim();
  const full = `${first} ${last}`.trim().replace(/\s+/g, " ");
  return full.length ? full : null;
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
    recordRateLimitHit(`account-settings-ip|${clientIp}`, {
      maxHits: 30,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    const ipStatus = getRateLimitStatus(`account-settings-ip|${clientIp}`, {
      maxHits: 30,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    if (!ipStatus.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        { status: 429, headers: { "retry-after": String(ipStatus.retryAfterSeconds) } },
      );
    }
  }

  recordRateLimitHit(`account-settings-email|${email}`, {
    maxHits: 20,
    windowMs: 10 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });
  const emailStatus = getRateLimitStatus(`account-settings-email|${email}`, {
    maxHits: 20,
    windowMs: 10 * 60 * 1000,
    blockMs: 15 * 60 * 1000,
  });
  if (!emailStatus.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Try again later." },
      { status: 429, headers: { "retry-after": String(emailStatus.retryAfterSeconds) } },
    );
  }

  const payload = (await request.json().catch(() => null)) as Payload | null;
  if (!payload) return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });

  const firstName = typeof payload.firstName === "string" ? payload.firstName : "";
  const lastName = typeof payload.lastName === "string" ? payload.lastName : "";
  const currentPassword =
    typeof payload.currentPassword === "string" ? payload.currentPassword : "";
  const newPassword = typeof payload.newPassword === "string" ? payload.newPassword : "";

  const updateData: Record<string, unknown> = {};

  const nextName = normalizeName(firstName, lastName);
  if (nextName && nextName.length > 120) {
    return NextResponse.json({ error: "Name is too long." }, { status: 400 });
  }
  updateData.name = nextName;

  if (typeof payload.notifyProductUpdates === "boolean") {
    updateData.notifyProductUpdates = payload.notifyProductUpdates;
  }
  if (typeof payload.notifySecurityAlerts === "boolean") {
    updateData.notifySecurityAlerts = payload.notifySecurityAlerts;
  }

  if (newPassword.length) {
    const passwordCheck = validatePassword(newPassword);
    if (!passwordCheck.ok) {
      return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
    }
    if (!currentPassword.length) {
      return NextResponse.json(
        { error: "Current password is required." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (!user.passwordHash) {
      return NextResponse.json(
        {
          error:
            "This account doesn't have a password set yet. Use 'Forgot password' to set one.",
        },
        { status: 400 },
      );
    }

    const ok = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!ok) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
    }

    updateData.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await prisma.user.update({
    where: { email },
    data: updateData,
    select: { id: true },
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}
