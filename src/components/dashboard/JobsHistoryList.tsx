"use client";

import { useEffect, useMemo, useState } from "react";

type JobStatus = "queued" | "processing" | "done" | "failed";

type JobItem = {
  id: string;
  status: JobStatus;
  error: string | null;
  createdAt: string;
  outputMime: string | null;
  outputSize: number | null;
  creditsCost: number;
  inputOriginalName: string | null;
};

type Props = {
  jobs: JobItem[];
};

type RetryResponse = {
  ok?: boolean;
  job?: JobItem;
  error?: string;
  errorCode?: string;
};

function formatBytes(value: number) {
  if (!Number.isFinite(value) || value <= 0) return "";
  return `${(value / 1024).toFixed(0)}KB`;
}

function formatStatus(status: JobStatus) {
  if (status === "queued") return "QUEUED";
  if (status === "processing") return "PROCESSING";
  if (status === "done") return "DONE";
  return "FAILED";
}

function friendlyError(value: string) {
  if (value.includes("Worker not configured")) {
    return "Processing is unavailable right now. Try again later.";
  }
  if (value.includes("Not enough credits")) {
    return "Not enough credits to retry this job.";
  }
  return value;
}

export default function JobsHistoryList({ jobs }: Props) {
  const [items, setItems] = useState<JobItem[]>(jobs);
  const [retrying, setRetrying] = useState<Record<string, string | null>>({});

  useEffect(() => {
    setItems(jobs);
    setRetrying({});
  }, [jobs]);

  const statusColors = useMemo(
    () => ({
      done: "bg-emerald-500/10 text-emerald-200 border-emerald-500/20",
      failed: "bg-red-500/10 text-red-200 border-red-500/20",
      processing: "bg-amber-500/10 text-amber-200 border-amber-500/20",
      queued: "bg-white/5 text-slate-200 border-white/10",
    }),
    [],
  );

  async function onRetry(id: string) {
    setRetrying((prev) => ({ ...prev, [id]: "loading" }));
    try {
      const response = await fetch(`/api/jobs/${id}`, { method: "POST" });
      const body = (await response.json().catch(() => null)) as RetryResponse | null;
      if (!response.ok || !body?.ok || !body.job) {
        const message = body?.error ?? "Couldn't retry this job.";
        setRetrying((prev) => ({ ...prev, [id]: message }));
        return;
      }

      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...body.job } : item)),
      );
      setRetrying((prev) => ({ ...prev, [id]: null }));
    } catch {
      setRetrying((prev) => ({ ...prev, [id]: "Couldn't retry this job." }));
    }
  }

  return (
    <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden">
      <div className="divide-y divide-white/5">
        {items.map((job) => {
          const retryState = retrying[job.id];
          const statusColor = statusColors[job.status];

          return (
            <div className="p-5 sm:p-6 flex flex-col gap-3" key={job.id}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">Job</div>
                  <div className="font-mono text-[11px] text-white break-all">
                    {job.id}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">
                    {new Date(job.createdAt).toLocaleString()} · {job.creditsCost}{" "}
                    credits
                  </div>
                  {job.inputOriginalName ? (
                    <div className="mt-1 text-[11px] text-slate-600">
                      File: {job.inputOriginalName}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`text-[11px] font-semibold px-2 py-1 rounded border ${statusColor}`}
                  >
                    {formatStatus(job.status)}
                  </span>
                  {job.status === "done" ? (
                    <a
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2 text-xs font-semibold text-white hover:bg-accent-blue transition-colors shadow-neon-primary hover:shadow-neon-blue"
                      href={`/api/jobs/${job.id}/download`}
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        download
                      </span>
                      Download
                    </a>
                  ) : null}
                  {job.status === "failed" ? (
                    <button
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors disabled:opacity-50"
                      disabled={retryState === "loading"}
                      onClick={() => onRetry(job.id)}
                      type="button"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        replay
                      </span>
                      {retryState === "loading" ? "Retrying..." : "Retry"}
                    </button>
                  ) : null}
                </div>
              </div>

              {job.status === "failed" && job.error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-xs text-red-200">
                  {friendlyError(job.error)}
                </div>
              ) : null}

              {retryState && retryState !== "loading" ? (
                <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-4 py-2 text-[11px] text-amber-200">
                  {retryState}
                </div>
              ) : null}

              {job.status === "done" ? (
                <div className="text-[11px] text-slate-500">
                  Output: {job.outputMime ?? "image"}{" "}
                  {typeof job.outputSize === "number" ? `· ${formatBytes(job.outputSize)}` : ""}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
