import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#05080f] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur">
        <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          404
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-3 text-sm text-slate-400">
          The page you’re looking for doesn’t exist or was moved.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 transition-colors"
            href="/"
          >
            <span className="material-symbols-outlined text-[18px]">home</span>
            Go home
          </Link>
          <Link
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            href="/help-center"
          >
            <span className="material-symbols-outlined text-[18px]">help</span>
            Help Center
          </Link>
        </div>
      </div>
    </main>
  );
}

