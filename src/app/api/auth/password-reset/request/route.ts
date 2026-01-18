import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { hashForLogs, logEvent, newRequestId } from "@/lib/log";
import { generateResetToken, hashToken } from "@/lib/passwordReset";
import { getClientIpFromHeaders } from "@/lib/loginRateLimit";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";
import { enforceSameOrigin } from "@/lib/security";

type RequestPayload = {
  email?: string;
};

export async function POST(request: NextRequest) {
  const requestId = newRequestId();
  try {
    enforceSameOrigin(request);
  } catch {
    logEvent("warn", "password_reset.request.forbidden", { requestId });
    return NextResponse.json({ ok: false, error: "Forbidden" }, { status: 403 });
  }

  const clientIp = getClientIpFromHeaders(Object.fromEntries(request.headers.entries()));
  if (clientIp) {
    recordRateLimitHit(`password-reset-request-ip|${clientIp}`, {
      maxHits: 10,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });
    const status = getRateLimitStatus(`password-reset-request-ip|${clientIp}`, {
      maxHits: 10,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });
    if (!status.allowed) {
      // Keep response shape to avoid user enumeration. Just don't send more emails.
      return NextResponse.json({ ok: true }, { status: 200 });
    }
  }

  const payload = (await request.json().catch(() => null)) as RequestPayload | null;
  const email = typeof payload?.email === "string" ? payload.email.trim().toLowerCase() : "";
  const isProd = process.env.NODE_ENV === "production";
  const emailHash = email ? hashForLogs(email) : null;

  // Always respond 200 to avoid user enumeration.
  if (!email || !email.includes("@")) {
    logEvent("info", "password_reset.request.ignored_invalid", { requestId, emailHash });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    logEvent("info", "password_reset.request.ignored_unknown", { requestId, emailHash });
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  const token = generateResetToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

  const origin = request.headers.get("origin");
  const appUrl = process.env.APP_URL ?? origin ?? "http://localhost:3000";
  const resetLink = `${appUrl.replace(/\/+$/, "")}/reset-password?token=${token}`;

  const resetToken = await prisma.passwordResetToken.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  const html = `
    <p>Hi${user.name ? ` ${user.name}` : ""},</p>
    <p>Click the link below to reset your password:</p>
    <p><a href="${resetLink}">${resetLink}</a></p>
    <p>This link expires in 1 hour.</p>
  `.trim();

  const emailResult = await sendEmail({
    to: user.email,
    subject: "Reset your BlueCut password",
    html,
    text: `Reset your password: ${resetLink}`,
  });

  if (!emailResult.sent && isProd) {
    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } }).catch(() => null);
  }

  logEvent(emailResult.sent ? "info" : "warn", "password_reset.request.sent", {
    requestId,
    userId: user.id,
    emailHash,
    sent: emailResult.sent,
    reason: emailResult.sent ? null : emailResult.reason,
  });

  // In dev, return debug info so you can test without SMTP.
  const includeDebug = !isProd;
  return NextResponse.json(
    {
      ok: true,
      emailSent: emailResult.sent,
      ...(includeDebug
        ? {
            resetLink,
            emailReason: emailResult.sent ? null : emailResult.reason,
          }
        : null),
    },
    { status: 200 },
  );
}
