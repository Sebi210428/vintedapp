import BlueCutDashboardLayout from "@/components/dashboard/BlueCutDashboardLayout";
import VintedDescriptionTool from "@/components/dashboard/VintedDescriptionTool";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";

export default async function DescriptionPage() {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  const creditsTotal = user?.creditsTotal ?? 2000;
  const creditsUsed = Math.max(0, creditsTotal - (user?.credits ?? creditsTotal));

  const history = user
    ? await prisma.vintedDescription.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          createdAt: true,
          productType: true,
          brand: true,
          size: true,
          condition: true,
          style: true,
          details: true,
          tone: true,
          language: true,
          short: true,
          selling: true,
          seo: true,
        },
      })
    : [];

  return (
    <BlueCutDashboardLayout
      activeNav="description"
      userName={user?.name ?? session?.user?.name ?? null}
      userEmail={user?.email ?? session?.user?.email ?? null}
      planName={user?.planName ?? "Free Plan"}
      planStatus={user?.planStatus ?? "Inactive"}
      creditsUsed={creditsUsed}
      creditsTotal={creditsTotal}
      breadcrumbItems={[
        { label: "Home", href: "/dashboard" },
        { label: "Tools" },
        { label: "Description" },
      ]}
      contentOverflowClassName="overflow-y-auto"
      contentClassName="dashboard-scroll"
      headerTitle="Description Generator"
      headerSubtitle={<span>Generate Vinted copy in seconds.</span>}
      headerShowStatusDot={false}
      headerClassName="backdrop-blur-sm sticky top-0 z-20 bg-deep-navy/80"
      searchPlaceholder="Search tools..."
      searchHideOnMobile
    >
      <div className="max-w-7xl mx-auto w-full">
        <VintedDescriptionTool
          initialHistory={history.map((item) => ({
            ...item,
            createdAt: item.createdAt.toISOString(),
          }))}
        />
      </div>
    </BlueCutDashboardLayout>
  );
}
