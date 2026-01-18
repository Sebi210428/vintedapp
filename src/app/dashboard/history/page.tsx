import Link from "next/link";

import BlueCutDashboardLayout from "@/components/dashboard/BlueCutDashboardLayout";
import JobsHistoryList from "@/components/dashboard/JobsHistoryList";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

const ALLOWED_STATUSES = new Set(["queued", "processing", "done", "failed"]);

type HistorySearchParams = {
  q?: string;
  status?: string;
};

function buildQuery(params: Record<string, string | null | undefined>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value);
  });
  const query = search.toString();
  return query ? `?${query}` : "";
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams?: HistorySearchParams;
}) {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  const creditsTotal = user?.creditsTotal ?? 2000;
  const creditsUsed = Math.max(0, creditsTotal - (user?.credits ?? creditsTotal));

  const rawQuery = typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const query = rawQuery.slice(0, 100);
  const statusRaw = typeof searchParams?.status === "string" ? searchParams.status : "";
  const status = ALLOWED_STATUSES.has(statusRaw) ? statusRaw : "";

  const jobs = user
    ? await prisma.job.findMany({
        where: {
          userId: user.id,
          ...(status ? { status } : null),
          ...(query
            ? {
                OR: [
                  { id: { contains: query } },
                  { error: { contains: query } },
                  { status: { contains: query } },
                ],
              }
            : null),
        },
        orderBy: { createdAt: "desc" },
        take: 50,
        select: {
          id: true,
          status: true,
          error: true,
          createdAt: true,
          outputMime: true,
          outputSize: true,
          creditsCost: true,
          inputOriginalName: true,
        },
      })
    : [];

  const statusFilters = [
    { key: "all", label: "All" },
    { key: "queued", label: "Queued" },
    { key: "processing", label: "Processing" },
    { key: "done", label: "Done" },
    { key: "failed", label: "Failed" },
  ] as const;

  const exportHref = `/api/jobs/export${buildQuery({
    q: query || null,
    status: status || null,
  })}`;

  return (
    <BlueCutDashboardLayout
      activeNav="history"
      userName={user?.name ?? session?.user?.name ?? null}
      userEmail={user?.email ?? session?.user?.email ?? null}
      planName={user?.planName ?? "Free Plan"}
      planStatus={user?.planStatus ?? "Inactive"}
      creditsUsed={creditsUsed}
      creditsTotal={creditsTotal}
      breadcrumbItems={[
        { label: "Home", href: "/dashboard" },
        { label: "History" },
      ]}
      contentOverflowClassName="overflow-y-auto"
      contentClassName="dashboard-scroll"
      searchPlaceholder="Search history..."
      searchAction="/dashboard/history"
      searchValue={query}
    >
      <div className="flex flex-col gap-2 mb-8">
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Processing History
        </h2>
        <p className="text-slate-500 text-sm">Your latest jobs (up to 50).</p>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {statusFilters.map((filter) => {
            const filterStatus = filter.key === "all" ? "" : filter.key;
            const href = `/dashboard/history${buildQuery({
              q: query || null,
              status: filterStatus || null,
            })}`;
            const active = status === filterStatus || (!status && filter.key === "all");
            return (
              <Link
                className={`rounded-full border px-3 py-1 text-[11px] font-semibold transition-colors ${
                  active
                    ? "border-accent-blue/40 bg-accent-blue/15 text-accent-blue"
                    : "border-white/10 bg-white/5 text-slate-300 hover:text-white hover:border-white/20"
                }`}
                href={href}
                key={filter.key}
              >
                {filter.label}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {(query || status) && (
            <span>
              Filtered {query ? `for "${query}"` : ""} {status ? `· ${status}` : ""}
            </span>
          )}
          <a
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-slate-200 hover:text-white hover:border-white/20"
            href={exportHref}
          >
            <span className="material-symbols-outlined text-[14px]">download</span>
            Export CSV
          </a>
        </div>
      </div>

      {jobs.length ? (
        <JobsHistoryList
          jobs={jobs.map((job) => ({
            ...job,
            createdAt: job.createdAt.toISOString(),
          }))}
        />
      ) : (
        <div className="glass-panel rounded-2xl border border-white/5 p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-blue opacity-10 mask-image-gradient pointer-events-none" />
          <div className="relative z-10 mx-auto max-w-lg">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
              <span className="material-symbols-outlined text-[28px]">history</span>
            </div>
            <h3 className="text-white font-bold text-lg">No jobs yet</h3>
            <p className="mt-2 text-sm text-slate-400">
              Upload an image from the dashboard to see it here.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-blue transition-colors shadow-neon-primary hover:shadow-neon-blue"
                href="/dashboard"
              >
                <span className="material-symbols-outlined text-[18px]">
                  add_photo_alternate
                </span>
                Go to Dashboard
              </Link>
              <Link
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
                href="/help-center"
              >
                <span className="material-symbols-outlined text-[18px]">help</span>
                Help Center
              </Link>
            </div>
          </div>
        </div>
      )}
    </BlueCutDashboardLayout>
  );
}
