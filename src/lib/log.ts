import crypto from "node:crypto";

type LogLevel = "debug" | "info" | "warn" | "error";

const levelRank: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function getLogLevel(): LogLevel {
  const raw = (process.env.LOG_LEVEL ?? "").toLowerCase();
  if (raw === "debug" || raw === "info" || raw === "warn" || raw === "error") return raw;
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

function shouldLog(level: LogLevel) {
  return levelRank[level] >= levelRank[getLogLevel()];
}

export function newRequestId() {
  return crypto.randomUUID();
}

export function hashForLogs(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 12);
}

export function logEvent(
  level: LogLevel,
  event: string,
  fields?: Record<string, unknown>,
) {
  if (!shouldLog(level)) return;

  const payload = {
    ts: new Date().toISOString(),
    level,
    event,
    ...(fields ?? {}),
  };

  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

