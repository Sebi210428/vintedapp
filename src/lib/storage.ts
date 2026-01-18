import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";

const STORAGE_ROOT = path.join(process.cwd(), "storage");

function safeJoinStorage(key: string) {
  const normalized = key.replace(/\\/g, "/").replace(/^\/+/, "");
  const fullPath = path.join(STORAGE_ROOT, normalized);
  const relative = path.relative(STORAGE_ROOT, fullPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid storage key");
  }
  return { fullPath, normalized };
}

export async function ensureStorageDirs() {
  await mkdir(path.join(STORAGE_ROOT, "inputs"), { recursive: true });
  await mkdir(path.join(STORAGE_ROOT, "outputs"), { recursive: true });
}

export function extensionFromMime(mime: string) {
  const m = mime.toLowerCase();
  if (m === "image/png") return ".png";
  if (m === "image/jpeg") return ".jpg";
  if (m === "image/webp") return ".webp";
  return "";
}

export async function writeInputFile(params: {
  jobId: string;
  file: File;
  buffer?: Buffer;
}): Promise<{
  key: string;
  mime: string;
  size: number;
  originalName: string | null;
}> {
  await ensureStorageDirs();

  const { jobId, file } = params;
  const mime = file.type || "application/octet-stream";
  const size = file.size;
  const originalName = typeof file.name === "string" ? file.name : null;
  const ext = extensionFromMime(mime);

  const key = `inputs/${jobId}${ext}`;
  const { fullPath } = safeJoinStorage(key);

  const bytes = params.buffer ?? Buffer.from(await file.arrayBuffer());
  await writeFile(fullPath, bytes);

  return { key, mime, size, originalName };
}

export async function writeOutputFile(params: {
  jobId: string;
  mime: string;
  buffer: Buffer;
}): Promise<{ key: string; mime: string; size: number }> {
  await ensureStorageDirs();

  const ext = extensionFromMime(params.mime);
  const key = `outputs/${params.jobId}${ext}`;
  const { fullPath } = safeJoinStorage(key);

  await writeFile(fullPath, params.buffer);
  const info = await stat(fullPath);

  return { key, mime: params.mime, size: info.size };
}

export async function readStorageFile(key: string) {
  const { fullPath } = safeJoinStorage(key);
  return readFile(fullPath);
}
