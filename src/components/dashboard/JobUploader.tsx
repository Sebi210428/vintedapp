"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

type JobStatus = "queued" | "processing" | "done" | "failed";

type JobResponse = {
  ok?: boolean;
  job?: {
    id: string;
    status: JobStatus;
    error: string | null;
    updatedAt: string;
  };
  error?: string;
};

type Props = {
  defaultOutputFormat: string;
  defaultQuality: number;
  jobCreditsCost: number;
  maxUploadMb: number;
  monthlyIncluded: number;
  monthlyUsed: number;
};

export default function JobUploader({
  defaultOutputFormat,
  defaultQuality,
  jobCreditsCost,
  maxUploadMb,
  monthlyIncluded,
  monthlyUsed,
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [jobError, setJobError] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (!jobStatus) return null;
    if (jobStatus === "queued") return "Queued";
    if (jobStatus === "processing") return "Processing";
    if (jobStatus === "done") return "Done";
    return "Failed";
  }, [jobStatus]);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;
    let intervalId: number | null = null;

    async function tick() {
      const response = await fetch(`/api/jobs/${jobId}`, { cache: "no-store" }).catch(
        () => null,
      );
      const body = (await response?.json().catch(() => null)) as JobResponse | null;
      if (!body?.ok || !body.job) return;

      if (cancelled) return;
      setJobStatus(body.job.status);
      setJobError(body.job.error ?? null);

      if (body.job.status === "done" || body.job.status === "failed") {
        if (intervalId) window.clearInterval(intervalId);
      }
    }

    void tick();
    intervalId = window.setInterval(() => void tick(), 2000);
    return () => {
      cancelled = true;
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [jobId]);

  async function onUpload() {
    setError(null);
    setErrorCode(null);
    setJobError(null);

    const file = inputRef.current?.files?.[0] ?? null;
    if (!file) {
      setError("Pick an image first.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);

      const response = await fetch("/api/jobs", { method: "POST", body: form });
      const body = (await response.json().catch(() => null)) as
        | {
            ok?: boolean;
            jobId?: string;
            error?: string;
            errorCode?: string;
            monthly?: { included: number; used: number };
            creditsRequired?: number;
          }
        | null;

      if (!response.ok || !body?.ok || !body.jobId) {
        if (body?.errorCode === "WORKER_NOT_CONFIGURED") {
          setErrorCode(body.errorCode);
          setError("Processing is temporarily unavailable. Please try again later.");
          return;
        }

        if (body?.errorCode === "NOT_ENOUGH_CREDITS") {
          setErrorCode(body.errorCode);
          const included = body.monthly?.included ?? monthlyIncluded;
          const used = body.monthly?.used ?? monthlyUsed;
          const required = typeof body.creditsRequired === "number" ? body.creditsRequired : null;
          setError(
            `You used ${used}/${included} free photos this month. Add credits to process more${
              required ? ` (needs ${required} credits).` : "."
            }`,
          );
          return;
        }

        setError(body?.error ?? "Couldn't upload. Try again.");
        return;
      }

      setJobId(body.jobId);
      setJobStatus("queued");
    } catch {
      setError("Couldn't upload. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const safeMonthlyIncluded =
    Number.isFinite(monthlyIncluded) && monthlyIncluded > 0 ? monthlyIncluded : 0;
  const safeMonthlyUsed = Number.isFinite(monthlyUsed) && monthlyUsed > 0 ? monthlyUsed : 0;
  const freeRemaining =
    safeMonthlyIncluded > 0 ? Math.max(0, safeMonthlyIncluded - safeMonthlyUsed) : 0;
  const willChargeCredits = safeMonthlyIncluded > 0 && safeMonthlyUsed >= safeMonthlyIncluded;

  return (
    <div className="relative z-10 text-center max-w-xl w-full p-5 sm:p-8 lg:p-10 rounded-3xl glass-panel transition-all duration-500 hover:border-accent-blue/30 hover:shadow-neon-blue">
      <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-[22px] bg-gradient-to-b from-accent-blue/10 to-transparent border border-accent-blue/20 flex items-center justify-center mb-6 sm:mb-8 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)] transition-shadow duration-500 relative">
        <div className="absolute inset-0 bg-accent-blue/20 blur-xl opacity-50 rounded-full" />
        <span
          className="material-symbols-outlined text-[34px] sm:text-[40px] text-accent-blue relative z-10"
          style={{ fontVariationSettings: "'FILL' 1" }}
        >
          add_photo_alternate
        </span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight drop-shadow-md">
        Background Remover
      </h2>
      <p className="text-slate-400 text-sm font-light mb-6 sm:mb-8 mx-auto leading-relaxed max-w-[420px]">
        Upload a product photo and get a clean cutout. Default output:{" "}
        <span className="text-white font-semibold">{defaultOutputFormat}</span> at{" "}
        <span className="text-white font-semibold">{defaultQuality}%</span>.
      </p>

      <div className="block w-full max-w-sm mx-auto">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left">
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs text-slate-400">
              {fileName ? (
                <>
                  Selected: <span className="text-white font-semibold">{fileName}</span>
                </>
              ) : (
                "Select an image (PNG/JPG/WEBP)"
              )}
            </div>
            <label className="cursor-pointer text-xs font-semibold text-accent-blue hover:text-white transition-colors">
              Browse
              <input
                accept="image/png,image/jpeg,image/webp"
                className="sr-only"
                onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
                ref={inputRef}
                type="file"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-col gap-1 text-[10px] text-slate-500">
            <div className="flex items-center justify-between gap-3">
              <span>Max {maxUploadMb}MB</span>
              <span>
                {safeMonthlyIncluded > 0
                  ? `Free this month: ${safeMonthlyUsed}/${safeMonthlyIncluded}`
                  : "Monthly free quota: off"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span>
                {willChargeCredits
                  ? `Extra: ${jobCreditsCost} credits / image`
                  : `Free remaining: ${freeRemaining}`}
              </span>
              <span>{willChargeCredits ? "Paid processing" : "Free processing"}</span>
            </div>
          </div>
        </div>

        {willChargeCredits ? (
          <div className="mt-4 rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-xs text-amber-100 text-left">
            You reached your {safeMonthlyIncluded} free photos for this month. Next uploads will
            cost credits.
          </div>
        ) : null}

        {error ? (
          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200 text-left">
            <div>{error}</div>
            {errorCode === "NOT_ENOUGH_CREDITS" ? (
              <div className="mt-2 text-xs text-red-100/90">
                <Link className="underline hover:text-white" href="/help-center">
                  How credits work
                </Link>{" "}
                <span className="text-red-100/60">•</span>{" "}
                <Link className="underline hover:text-white" href="/dashboard/account">
                  Account
                </Link>
              </div>
            ) : null}
          </div>
        ) : null}

        {jobId ? (
          <div className="mt-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200 text-left">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs text-slate-400">Job</div>
                <div className="font-mono text-[11px] text-white break-all">{jobId}</div>
              </div>
              <div className="text-xs font-semibold text-slate-300">
                {statusLabel ?? "…"}
              </div>
            </div>

            {jobError ? (
              <div className="mt-3 text-xs text-red-200">{jobError}</div>
            ) : null}

            <div className="mt-3 flex items-center gap-3 text-xs">
              <Link className="underline hover:text-white" href="/dashboard/history">
                View history
              </Link>
              {jobStatus === "done" ? (
                <a className="underline hover:text-white" href={`/api/jobs/${jobId}/download`}>
                  Download result
                </a>
              ) : null}
            </div>
          </div>
        ) : null}

        <button
          className="mt-5 group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-accent-primary text-base font-bold text-white shadow-[0_0_20px_rgba(13,93,242,0.5)] transition-all duration-300 hover:bg-accent-blue hover:shadow-[0_0_30px_rgba(13,93,242,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={submitting}
          onClick={onUpload}
          type="button"
        >
          <span className="relative z-10 flex items-center gap-2">
            {submitting ? "Uploading..." : "Upload & Process"}
            <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
              arrow_forward
            </span>
          </span>
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        </button>
      </div>
    </div>
  );
}
