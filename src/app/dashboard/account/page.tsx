import BlueCutDashboardLayout from "@/components/dashboard/BlueCutDashboardLayout";
import AccountSettingsForm from "@/components/dashboard/AccountSettingsForm";
import StripeBillingActions from "@/components/dashboard/StripeBillingActions";
import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getStripePlanByPriceId } from "@/lib/stripePlans";

export default async function AccountSettingsPage() {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  const user = email ? await prisma.user.findUnique({ where: { email } }) : null;

  const creditsTotal = user?.creditsTotal ?? 2000;
  const creditsUsed = Math.max(0, creditsTotal - (user?.credits ?? creditsTotal));
  const planName = user?.planName ?? "Free Plan";
  const planStatus = user?.planStatus ?? "Inactive";
  const stripePlan = getStripePlanByPriceId(user?.stripePriceId ?? null);
  const currentPlanKey = stripePlan?.key ?? null;
  const hasStripeCustomer = Boolean(user?.stripeCustomerId);

  const fullName = user?.name ?? session?.user?.name ?? "";
  const [firstName = "", ...lastNameParts] = fullName.split(" ");
  const lastName = lastNameParts.join(" ").trim();

  const safeCreditsTotal = creditsTotal > 0 ? creditsTotal : 1;
  const creditsProgress = Math.min(
    100,
    Math.max(0, Math.round((creditsUsed / safeCreditsTotal) * 100)),
  );

  return (
    <BlueCutDashboardLayout
      activeNav="account"
      userName={user?.name ?? session?.user?.name ?? null}
      userEmail={user?.email ?? session?.user?.email ?? null}
      planName={planName}
      planStatus={planStatus}
      creditsUsed={creditsUsed}
      creditsTotal={creditsTotal}
      breadcrumbItems={[
        { label: "Home", href: "/dashboard" },
        { label: "Settings" },
        { label: "Account" },
      ]}
      contentOverflowClassName="overflow-y-auto"
      contentClassName="dashboard-scroll"
      headerTitle="Account Settings"
      headerSubtitle={<span>Manage your personal details and security.</span>}
      headerShowStatusDot={false}
      headerClassName="backdrop-blur-sm sticky top-0 z-20 bg-deep-navy/80"
      searchPlaceholder="Search settings..."
      searchHideOnMobile
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto pb-12">
        <div className="lg:col-span-2">
          <AccountSettingsForm
            email={user?.email ?? session?.user?.email ?? ""}
            initialFirstName={firstName}
            initialLastName={lastName}
            initialNotifyProductUpdates={user?.notifyProductUpdates ?? true}
            initialNotifySecurityAlerts={user?.notifySecurityAlerts ?? true}
          />
        </div>

        <div className="space-y-8">
          <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[120px] text-accent-primary rotate-12">
                diamond
              </span>
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
                  Plan
                </span>
                <span className="bg-accent-primary/20 text-accent-blue text-[10px] font-bold px-2 py-1 rounded border border-accent-primary/20">
                  {planStatus.toUpperCase()}
                </span>
              </div>
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-white mb-1">{planName}</h2>
                <p className="text-slate-400 text-xs">
                  Manage your subscription or switch plans below.
                </p>
              </div>
              <div className="bg-navy-light p-4 rounded-xl border border-white/5 mb-2 relative overflow-hidden">
                <div className="flex justify-between text-[11px] mb-2 font-medium">
                  <span className="text-slate-400">Credits</span>
                  <span className="text-white">
                    {creditsUsed.toLocaleString()} / {safeCreditsTotal.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-[#02040a] h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-gradient-to-r from-accent-primary to-accent-blue h-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                    style={{ width: `${creditsProgress}%` }}
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-500">
                Tip: once billing is enabled, this section will show renewal and payment
                info.
              </p>
            </div>
          </div>
          <StripeBillingActions
            currentPlanKey={currentPlanKey}
            planStatus={planStatus}
            hasStripeCustomer={hasStripeCustomer}
          />
        </div>
      </div>
    </BlueCutDashboardLayout>
  );
}
