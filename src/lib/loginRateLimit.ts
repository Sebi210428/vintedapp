type RateLimitRecord = {
  windowStartedAt: number;
  attempts: number;
  blockedUntil: number;
};

type LoginRateLimitConfig = {
  maxAttempts: number;
  windowMs: number;
  blockMs: number;
};

const defaultConfig: LoginRateLimitConfig = {
  maxAttempts: 5,
  windowMs: 10 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
};

const globalForLoginRateLimit = globalThis as unknown as {
  loginRateLimit?: Map<string, RateLimitRecord>;
};

const store = globalForLoginRateLimit.loginRateLimit ?? new Map<string, RateLimitRecord>();
globalForLoginRateLimit.loginRateLimit = store;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getClientIpFromHeaders(headers: Record<string, string | undefined> | undefined) {
  const forwarded = headers?.["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = headers?.["x-real-ip"];
  if (typeof realIp === "string" && realIp.length) return realIp.trim();

  return null;
}

function keyFor(email: string, ip: string | null) {
  return `${normalizeEmail(email)}|${ip ?? "unknown"}`;
}

export function getLoginRateLimitStatus(
  email: string,
  ip: string | null,
  config: LoginRateLimitConfig = defaultConfig,
) {
  const now = Date.now();
  const key = keyFor(email, ip);
  const record = store.get(key);

  if (!record) return { allowed: true as const, retryAfterSeconds: 0 };
  if (record.blockedUntil > now) {
    return {
      allowed: false as const,
      retryAfterSeconds: Math.ceil((record.blockedUntil - now) / 1000),
    };
  }

  if (now - record.windowStartedAt > config.windowMs) {
    store.delete(key);
    return { allowed: true as const, retryAfterSeconds: 0 };
  }

  return { allowed: true as const, retryAfterSeconds: 0 };
}

export function recordFailedLoginAttempt(
  email: string,
  ip: string | null,
  config: LoginRateLimitConfig = defaultConfig,
) {
  const now = Date.now();
  const key = keyFor(email, ip);
  const record = store.get(key);

  if (!record || now - record.windowStartedAt > config.windowMs) {
    store.set(key, {
      windowStartedAt: now,
      attempts: 1,
      blockedUntil: 0,
    });
    return;
  }

  record.attempts += 1;
  if (record.attempts >= config.maxAttempts) {
    record.blockedUntil = now + config.blockMs;
  }
  store.set(key, record);
}

export function clearLoginRateLimit(email: string, ip: string | null) {
  store.delete(keyFor(email, ip));
}

