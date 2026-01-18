import BlueCutDashboardLayout from "@/components/dashboard/BlueCutDashboardLayout";
import JobUploader from "@/components/dashboard/JobUploader";
import { getServerAuthSession } from "@/lib/auth";
import { getJobCreditsCost, getMaxUploadBytes } from "@/lib/jobs";
import prisma from "@/lib/prisma";
import { getMonthRange, getMonthlyIncludedJobs } from "@/lib/quota";

export default async function DashboardPage() {
  const jobCreditsCost = getJobCreditsCost();
  const maxUploadMb = Math.max(1, Math.floor(getMaxUploadBytes() / (1024 * 1024)));
  const monthlyIncluded = getMonthlyIncludedJobs();

  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  const creditsTotal = user?.creditsTotal ?? 2000;
  const creditsUsed = Math.max(0, creditsTotal - (user?.credits ?? creditsTotal));

  const { start: monthStart, end: monthEnd } = getMonthRange(new Date());
  const monthlyUsed = user
    ? await prisma.job.count({
        where: { userId: user.id, createdAt: { gte: monthStart, lt: monthEnd } },
      })
    : 0;

  return (
    <BlueCutDashboardLayout
      activeNav="tool"
      userName={user?.name ?? session?.user?.name ?? null}
      userEmail={user?.email ?? session?.user?.email ?? null}
      planName={user?.planName ?? "Free Plan"}
      planStatus={user?.planStatus ?? "Inactive"}
      creditsUsed={creditsUsed}
      creditsTotal={creditsTotal}
      breadcrumbItems={[
        { label: "Home", href: "/dashboard" },
        { label: "Background Remover" },
      ]}
      contentOverflowClassName="overflow-hidden"
      contentClassName="dashboard-scroll"
      searchPlaceholder="Search..."
    >
      <div className="flex-1 relative flex flex-col items-center justify-center">
        <JobUploader
          defaultOutputFormat={user?.outputFormat ?? "PNG"}
          defaultQuality={user?.defaultQuality ?? 90}
          jobCreditsCost={jobCreditsCost}
          maxUploadMb={maxUploadMb}
          monthlyIncluded={monthlyIncluded}
          monthlyUsed={monthlyUsed}
        />
      </div>
    </BlueCutDashboardLayout>
  );
}
