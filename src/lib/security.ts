import crypto from "node:crypto";

import type { NextRequest } from "next/server";

export function safeEqualSecret(a: string, b: string) {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export function enforceSameOrigin(request: NextRequest) {
  const appUrl = process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "";
  const isProd = process.env.NODE_ENV === "production";

  if (!appUrl) {
    if (isProd) throw new Error("MissingAppUrl");
    return;
  }

  const expectedOrigin = new URL(appUrl).origin;
  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");

  let originToCheck = origin ?? "";
  if (!originToCheck && referer) {
    try {
      originToCheck = new URL(referer).origin;
    } catch {
      originToCheck = "";
    }
  }

  if (!originToCheck) {
    if (isProd) throw new Error("BadOrigin");
    return;
  }

  if (originToCheck !== expectedOrigin) throw new Error("BadOrigin");
}

export function base64SizeBytes(base64: string) {
  const normalized = base64.replace(/\s+/g, "");
  const padding = normalized.endsWith("==") ? 2 : normalized.endsWith("=") ? 1 : 0;
  return Math.max(0, Math.floor((normalized.length * 3) / 4) - padding);
}

export function validatePassword(password: string) {
  if (password.length < 8) {
    return { ok: false as const, error: "Password must be at least 8 characters." };
  }
  if (password.length > 128) {
    return { ok: false as const, error: "Password must be at most 128 characters." };
  }
  if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    return {
      ok: false as const,
      error: "Password must include a letter and a number.",
    };
  }
  return { ok: true as const };
}
