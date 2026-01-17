import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { logEvent, newRequestId } from "@/lib/log";
import { hashToken } from "@/lib/passwordReset";
import { getClientIpFromHeaders } from "@/lib/loginRateLimit";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";
import { enforceSameOrigin, validatePassword } from "@/lib/security";

type ConfirmPayload = {
  token?: string;
  password?: string;
};

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    enforceSameOrigin(request);
  } catch {
    logEvent("warn", "password_reset.confirm.forbidden", { requestId });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientIp = getClientIpFromHeaders(Object.fromEntries(request.headers.entries()));
  if (clientIp) {
    recordRateLimitHit(`password-reset-confirm-ip|${clientIp}`, {
      maxHits: 20,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    const ipStatus = getRateLimitStatus(`password-reset-confirm-ip|${clientIp}`, {
      maxHits: 20,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    if (!ipStatus.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "retry-after": String(ipStatus.retryAfterSeconds) } },
      );
    }
  }

  const payload = (await request.json().catch(() => null)) as ConfirmPayload | null;
  const token = typeof payload?.token === "string" ? payload.token : "";
  const password = typeof payload?.password === "string" ? payload.password : "";

  if (!token || token.length < 20) {
    return NextResponse.json({ error: "Invalid token" }, { status: 400 });
  }
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
  }

  const tokenHash = hashToken(token);

  if (clientIp) {
    recordRateLimitHit(`password-reset-confirm-token|${clientIp}|${tokenHash}`, {
      maxHits: 10,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    const tokenStatus = getRateLimitStatus(`password-reset-confirm-token|${clientIp}|${tokenHash}`, {
      maxHits: 10,
      windowMs: 10 * 60 * 1000,
      blockMs: 15 * 60 * 1000,
    });
    if (!tokenStatus.allowed) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429, headers: { "retry-after": String(tokenStatus.retryAfterSeconds) } },
      );
    }
  }

  const reset = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
  });

  if (!reset || reset.usedAt || reset.expiresAt.getTime() < Date.now()) {
    logEvent("info", "password_reset.confirm.invalid", { requestId });
    return NextResponse.json({ error: "Token expired or invalid" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
  ]);

  logEvent("info", "password_reset.confirm.done", { requestId, userId: reset.userId });
  return NextResponse.json({ ok: true }, { status: 200 });
}
