type RateLimitRecord = {
  windowStartedAt: number;
  hits: number;
  blockedUntil: number;
};

export type RateLimitConfig = {
  maxHits: number;
  windowMs: number;
  blockMs: number;
};

const globalForRateLimit = globalThis as unknown as {
  requestRateLimit?: Map<string, RateLimitRecord>;
};

const store = globalForRateLimit.requestRateLimit ?? new Map<string, RateLimitRecord>();
globalForRateLimit.requestRateLimit = store;

const defaultConfig: RateLimitConfig = {
  maxHits: 20,
  windowMs: 10 * 60 * 1000,
  blockMs: 15 * 60 * 1000,
};

export function getRateLimitStatus(key: string, config: RateLimitConfig = defaultConfig) {
  const now = Date.now();
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

export function recordRateLimitHit(key: string, config: RateLimitConfig = defaultConfig) {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now - record.windowStartedAt > config.windowMs) {
    store.set(key, { windowStartedAt: now, hits: 1, blockedUntil: 0 });
    return;
  }

  record.hits += 1;
  if (record.hits >= config.maxHits) {
    record.blockedUntil = now + config.blockMs;
  }
  store.set(key, record);
}

export function clearRateLimitKey(key: string) {
  store.delete(key);
}

