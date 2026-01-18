"use client";

import Link from "next/link";

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: Props) {
  return (
    <main className="min-h-screen bg-[#05080f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Something went wrong
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Unexpected error</h1>
        <p className="mt-3 text-sm text-slate-400">
          Please try again. If the problem persists, contact support.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            onClick={() => reset()}
            type="button"
          >
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Try again
          </button>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            href="/"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Go home
          </Link>
        </div>

        <details className="mt-6 rounded-xl border border-white/10 bg-black/20 p-4">
          <summary className="cursor-pointer text-sm font-semibold text-slate-300">
            Technical details
          </summary>
          <pre className="mt-3 overflow-auto text-[11px] leading-relaxed text-slate-400">
            {String(error?.message ?? "Unknown error")}
          </pre>
        </details>
      </div>
    </main>
  );
}

