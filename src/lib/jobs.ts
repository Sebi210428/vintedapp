import crypto from "node:crypto";

export function newJobId() {
  return crypto.randomUUID();
}

export function getJobCreditsCost() {
  const raw = process.env.JOB_CREDITS_COST;
  const parsed = raw ? Number(raw) : NaN;
  if (Number.isFinite(parsed) && parsed > 0) return Math.floor(parsed);
  return 50;
}

export function getMaxUploadBytes() {
  const raw = process.env.MAX_UPLOAD_MB;
  const parsed = raw ? Number(raw) : NaN;
  const mb = Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  return Math.floor(mb * 1024 * 1024);
}

export function isImageMime(mime: string) {
  const m = mime.toLowerCase();
  return m === "image/png" || m === "image/jpeg" || m === "image/webp";
}

