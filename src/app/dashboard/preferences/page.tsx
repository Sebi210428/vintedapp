import BlueCutDashboardLayout from "@/components/dashboard/BlueCutDashboardLayout";
import PreferencesForm from "@/components/dashboard/PreferencesForm";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function PreferencesPage() {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  const creditsTotal = user?.creditsTotal ?? 2000;
  const creditsUsed = Math.max(0, creditsTotal - (user?.credits ?? creditsTotal));

  return (
    <BlueCutDashboardLayout
      activeNav="preferences"
      userName={user?.name ?? session?.user?.name ?? null}
      userEmail={user?.email ?? session?.user?.email ?? null}
      planName={user?.planName ?? "Free Plan"}
      planStatus={user?.planStatus ?? "Inactive"}
      creditsUsed={creditsUsed}
      creditsTotal={creditsTotal}
      breadcrumbItems={[
        { label: "Home", href: "/dashboard" },
        { label: "Settings" },
        { label: "Preferences" },
      ]}
      contentOverflowClassName="overflow-y-auto overflow-x-hidden"
      contentClassName="dashboard-scroll accent-blue-controls"
      headerTitle="Preferences"
      headerSubtitle="System Operational"
      headerShowStatusDot
      searchPlaceholder="Search settings..."
    >
      <PreferencesForm
        initialAllowUsageData={user?.allowUsageData ?? false}
        initialDefaultQuality={user?.defaultQuality ?? 90}
        initialOutputFormat={user?.outputFormat ?? "PNG"}
        initialPreferredLanguage={user?.preferredLanguage ?? "en"}
        initialPublicProfile={user?.publicProfile ?? true}
        initialTimezone={user?.timezone ?? "UTC"}
      />
    </BlueCutDashboardLayout>
  );
}
