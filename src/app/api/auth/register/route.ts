import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getClientIpFromHeaders } from "@/lib/loginRateLimit";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";
import { enforceSameOrigin, validatePassword } from "@/lib/security";

type RegisterPayload = {
  email?: string;
  password?: string;
  name?: string;
};

export async function POST(request: NextRequest) {
  try {
    enforceSameOrigin(request);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const clientIp = getClientIpFromHeaders(Object.fromEntries(request.headers.entries()));
  if (clientIp) {
    recordRateLimitHit(`register-ip|${clientIp}`, {
      maxHits: 10,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });
    const ipStatus = getRateLimitStatus(`register-ip|${clientIp}`, {
      maxHits: 10,
      windowMs: 60 * 60 * 1000,
      blockMs: 60 * 60 * 1000,
    });
    if (!ipStatus.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Try again later." },
        {
          status: 429,
          headers: { "retry-after": String(ipStatus.retryAfterSeconds) },
        },
      );
    }
  }

  const payload = (await request.json().catch(() => null)) as RegisterPayload | null;
  if (!payload) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const email = typeof payload.email === "string" ? payload.email.trim().toLowerCase() : "";
  const password = typeof payload.password === "string" ? payload.password : "";
  const name = typeof payload.name === "string" ? payload.name.trim() : "";

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }
  const passwordCheck = validatePassword(password);
  if (!passwordCheck.ok) {
    return NextResponse.json({ error: passwordCheck.error }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      name: name.length ? name : null,
      passwordHash,
      credits: 2000,
      creditsTotal: 2000,
      planName: "Free Plan",
      planStatus: "Inactive",
    },
    select: { id: true, email: true },
  });

  return NextResponse.json(user, { status: 201 });
}
