import Image from "next/image";
import Link from "next/link";
import LogoutButton from "@/components/auth/LogoutButton";
import DashboardHeaderActions from "@/components/dashboard/DashboardHeaderActions";

type ActiveNav = "tool" | "description" | "history" | "account" | "preferences";

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type BlueCutDashboardLayoutProps = {
  activeNav: ActiveNav;
  userName?: string | null;
  userEmail?: string | null;
  planName?: string;
  planStatus?: string;
  creditsUsed?: number;
  creditsTotal?: number;
  headerTitle?: string;
  headerSubtitle?: React.ReactNode;
  headerShowStatusDot?: boolean;
  searchPlaceholder?: string;
  searchAction?: string;
  searchName?: string;
  searchValue?: string;
  searchHideOnMobile?: boolean;
  headerClassName?: string;
  breadcrumbItems: BreadcrumbItem[];
  contentOverflowClassName?: string;
  contentClassName?: string;
  children: React.ReactNode;
};

export default function BlueCutDashboardLayout({
  activeNav,
  userName,
  userEmail,
  planName = "Free Plan",
  planStatus = "Inactive",
  creditsUsed = 0,
  creditsTotal = 2000,
  headerTitle = "Dashboard",
  headerSubtitle = "System Operational",
  headerShowStatusDot = true,
  searchPlaceholder = "Search...",
  searchAction,
  searchName = "q",
  searchValue,
  searchHideOnMobile = false,
  headerClassName,
  breadcrumbItems,
  contentOverflowClassName = "overflow-hidden",
  contentClassName,
  children,
}: BlueCutDashboardLayoutProps) {
  const safeCreditsTotal =
    Number.isFinite(creditsTotal) && creditsTotal > 0 ? creditsTotal : 1;
  const safeCreditsUsed =
    Number.isFinite(creditsUsed) && creditsUsed > 0 ? creditsUsed : 0;
  const creditsProgress = Math.min(
    100,
    Math.max(0, Math.round((safeCreditsUsed / safeCreditsTotal) * 100)),
  );

  const mobileNavItems = [
    {
      key: "tool" as const,
      href: "/dashboard",
      label: "Tool",
      icon: "magic_button",
    },
    {
      key: "description" as const,
      href: "/dashboard/description",
      label: "Desc",
      icon: "edit_note",
    },
    {
      key: "history" as const,
      href: "/dashboard/history",
      label: "History",
      icon: "history",
    },
    {
      key: "account" as const,
      href: "/dashboard/account",
      label: "Account",
      icon: "manage_accounts",
    },
    {
      key: "preferences" as const,
      href: "/dashboard/preferences",
      label: "Prefs",
      icon: "tune",
    },
  ];

  return (
    <div className="h-[100svh] w-screen overflow-hidden flex text-sm bg-deep-navy selection:bg-accent-blue/20 selection:text-accent-blue font-jakarta">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[800px] h-[800px] bg-accent-primary/20 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-accent-blue/10 blur-[100px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-subtle-mesh opacity-60" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDXEgLTzM1nxGNnUhHDcY5bboWCNFxQ2jXEzunevaTedoY44qNPMixQ49uM5emICKMmy9pMCqOSQ9jlOaXXfACbMcxf0htX8OA0qSyaohua53NN-DIpVPlKuFmB01kJDgi9-3D4jlAJe5ZY7tzXKSZixSG5pfa3zsbdiebD9C4awanOpdJ2rzGb8EflO4Bi91gb1t5lEQFqp23fgYJ_fCtXF0d02ANEJ7UD61kF3CYwkjRhSiBC7Bj7ZAWzChLdbCZE29jFKGycusI')",
            backgroundSize: "cover",
          }}
        />
      </div>

      <aside className="hidden md:flex w-[280px] flex-none z-30 flex-col sidebar-glass h-full relative border-r border-white/5 overflow-y-auto">
        <div className="h-24 flex items-center px-8">
          <Link className="flex items-center gap-3.5 w-full" href="/" title="Back to site">
            <div className="relative w-9 h-9 flex items-center justify-center group">
              <div className="absolute inset-0 bg-accent-blue/20 blur-md rounded-lg group-hover:bg-accent-blue/40 transition-all duration-500" />
              <div className="relative z-10 w-full h-full bg-gradient-to-br from-white/10 to-transparent rounded-lg border border-accent-blue/30 flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <svg
                  className="w-5 h-5 text-accent-blue"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <span className="text-white font-bold text-xl tracking-tight flex flex-col leading-none">
              BlueCut
              <span className="text-[10px] font-medium text-accent-blue tracking-[0.2em] uppercase opacity-90 mt-0.5">
                Engine
              </span>
            </span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <div className="px-4 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500/80">
            Tools
          </div>

          <Link
            className={`nav-link flex items-center gap-3 px-4 py-3 group ${
              activeNav === "tool" ? "active" : "text-slate-400"
            }`}
            href="/dashboard"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-300">
              magic_button
            </span>
            <span
              className={`font-medium ${
                activeNav === "tool"
                  ? ""
                  : "group-hover:text-white transition-colors"
              }`}
            >
              Background Remover
            </span>
            {activeNav === "tool" ? (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3b82f6]" />
            ) : null}
          </Link>

          <Link
            className={`nav-link flex items-center gap-3 px-4 py-3 group ${
              activeNav === "description" ? "active" : "text-slate-400"
            }`}
            href="/dashboard/description"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-300">
              edit_note
            </span>
            <span
              className={`font-medium ${
                activeNav === "description"
                  ? ""
                  : "group-hover:text-white transition-colors"
              }`}
            >
              Description
            </span>
            {activeNav === "description" ? (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3b82f6]" />
            ) : null}
          </Link>

          <Link
            className={`nav-link flex items-center gap-3 px-4 py-3 group ${
              activeNav === "history" ? "active" : "text-slate-400"
            }`}
            href="/dashboard/history"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform duration-300">
              history
            </span>
            <span
              className={`font-medium ${
                activeNav === "history"
                  ? ""
                  : "group-hover:text-white transition-colors"
              }`}
            >
              History
            </span>
            {activeNav === "history" ? (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3b82f6]" />
            ) : null}
          </Link>

          <div className="px-4 mt-8 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-500/80">
            Settings
          </div>
          <Link
            className={`nav-link flex items-center gap-3 px-4 py-3 group ${
              activeNav === "account" ? "active" : "text-slate-400"
            }`}
            href="/dashboard/account"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:text-accent-blue transition-colors">
              manage_accounts
            </span>
            <span
              className={`font-medium ${
                activeNav === "account"
                  ? ""
                  : "group-hover:text-white transition-colors"
              }`}
            >
              Account
            </span>
            {activeNav === "account" ? (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3b82f6]" />
            ) : null}
          </Link>

          <Link
            className={`nav-link flex items-center gap-3 px-4 py-3 group ${
              activeNav === "preferences" ? "active" : "text-slate-400"
            }`}
            href="/dashboard/preferences"
          >
            <span className="material-symbols-outlined text-[20px] group-hover:text-accent-blue transition-colors">
              tune
            </span>
            <span
              className={`font-medium ${
                activeNav === "preferences"
                  ? ""
                  : "group-hover:text-white transition-colors"
              }`}
            >
              Preferences
            </span>
            {activeNav === "preferences" ? (
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_#3b82f6]" />
            ) : null}
          </Link>
        </nav>

        <div className="p-4 mx-4 mb-4 rounded-xl bg-gradient-to-br from-accent-primary/20 to-transparent border border-accent-primary/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-accent-blue/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-white">
                <div className="p-1 rounded bg-accent-primary/30 text-accent-blue">
                  <span className="material-symbols-outlined text-[16px]">
                    electric_bolt
                  </span>
                </div>
                <span className="text-xs font-bold uppercase tracking-wider">
                  {planName}
                </span>
              </div>
              <span className="text-[10px] text-accent-blue font-semibold bg-accent-blue/10 px-1.5 py-0.5 rounded border border-accent-blue/20">
                {planStatus}
              </span>
            </div>
            <div className="w-full bg-navy-light h-1.5 rounded-full overflow-hidden mb-2 border border-white/5">
              <div
                className="bg-gradient-to-r from-accent-primary to-accent-blue h-full shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                style={{ width: `${creditsProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium flex justify-between">
              <span>Credits used</span>
              <span className="text-white">
                {safeCreditsUsed.toLocaleString()} /{" "}
                {safeCreditsTotal.toLocaleString()}
              </span>
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-white/5 flex items-center gap-3 bg-[#02040a]">
          <div className="w-9 h-9 rounded-lg bg-navy-light border border-white/10 overflow-hidden shrink-0 relative group cursor-pointer">
            <Image
              alt="User"
              className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
              height={36}
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuD1NOcGpUyZC3wt0X4ViHPqZZcgyk3uiCrt886upM6FzqgjElx5b3G22IGWSN4esw2zcJr4YTJaalXZRZB8Xfu1Im7Z1u-yeOPFc6uMtezZ4ASDe35vKn6BoN-1d8CTO0QLndTdot7EFTfc8oBwueGqEConYERtYsDhVqF6sgzkIPhNegIeAdfA4gi6sXQxrMWNMGwD2MzpDalwfF6hxMEzy0QlUWobuItd6eIyLPnuzrAmEMLmcDA07wF0ktmW4_vfmmiVwCAD9aY"
              width={36}
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 group-hover:ring-accent-blue/40 rounded-lg transition-all" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-white truncate group-hover:text-accent-blue transition-colors cursor-pointer">
              {userName ?? "Account"}
            </span>
            <span className="text-[10px] text-slate-500 truncate">
              {userEmail ?? ""}
            </span>
          </div>
          <LogoutButton
            className="ml-auto text-slate-500 hover:text-white transition-colors"
          />
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative z-10 bg-deep-navy">
        <header
          className={`h-14 sm:h-18 lg:h-24 flex-none flex items-center justify-between px-3 sm:px-6 lg:px-12 border-b border-white/[0.03] ${
            headerClassName ?? ""
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex flex-col justify-center min-w-0">
              <h1 className="text-white font-bold text-base sm:text-xl lg:text-2xl tracking-tight glow-text truncate">
                {headerTitle}
              </h1>
              <p className="hidden md:flex text-slate-500 text-xs mt-1 font-medium items-center gap-2 truncate">
                {headerShowStatusDot ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.6)]" />
                ) : null}
                {headerSubtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {searchPlaceholder ? (
              <form
                action={searchAction}
                className={`relative ${
                  searchHideOnMobile ? "hidden md:block" : "hidden sm:block"
                }`}
                method="GET"
                role="search"
              >
                <input
                  className="bg-navy-light border border-white/10 rounded-full py-1.5 px-4 pl-9 text-xs text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 w-36 sm:w-56 lg:w-64 transition-all placeholder:text-slate-600"
                  defaultValue={searchValue}
                  name={searchName}
                  placeholder={searchPlaceholder}
                  type="text"
                />
                <span className="material-symbols-outlined absolute left-3 top-1.5 text-slate-600 text-[16px]">
                  search
                </span>
              </form>
            ) : null}
            <Link
              className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
              href="/"
              title="Back to site"
            >
              <span className="material-symbols-outlined text-[20px]">home</span>
            </Link>
            <div className="hidden sm:block h-8 w-px bg-white/10 mx-2" />
            <DashboardHeaderActions />
          </div>
        </header>

        <div
          className={`flex-1 p-4 pb-6 sm:p-6 sm:pb-24 lg:p-12 lg:pb-12 flex flex-col relative ${contentOverflowClassName} ${
            contentClassName ?? ""
          }`}
        >
          <div className="sm:hidden mb-4">
            <div className="grid grid-cols-5 gap-2">
              {mobileNavItems.map((item) => {
                const active = activeNav === item.key;
                return (
                  <Link
                    className={`flex w-full flex-col items-center justify-center gap-1 rounded-2xl border px-2 py-2 text-[9px] font-semibold transition-all ${
                      active
                        ? "text-accent-blue border-accent-blue/50 bg-accent-blue/15 shadow-[0_0_18px_rgba(59,130,246,0.25)]"
                        : "text-slate-400 border-white/10 bg-white/[0.02] hover:text-white hover:bg-white/5 hover:border-white/20"
                    }`}
                    href={item.href}
                    key={item.key}
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {item.icon}
                    </span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="sm:hidden mb-5 rounded-2xl border border-white/10 bg-[#05080f]/70 p-4 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-navy-light border border-white/10 overflow-hidden shrink-0">
                <div className="w-full h-full bg-gradient-to-br from-accent-blue/20 to-transparent" />
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-white truncate">
                  {userName ?? "Account"}
                </div>
                <div className="text-[11px] text-slate-500 truncate">
                  {userEmail ?? ""}
                </div>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <Link
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  href="/help-center"
                  title="Help Center"
                >
                  <span className="material-symbols-outlined text-[18px]">help</span>
                </Link>
                <LogoutButton className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-slate-400 hover:text-white hover:bg-white/5 transition-colors" />
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-navy-light/60 p-3">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span>{planName}</span>
                <span className="text-accent-blue">{planStatus}</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-[#02040a] border border-white/5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-primary to-accent-blue"
                  style={{ width: `${creditsProgress}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                <span>Credits used</span>
                <span className="text-white">
                  {safeCreditsUsed.toLocaleString()} /{" "}
                  {safeCreditsTotal.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2 mb-6 lg:mb-8 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest text-slate-500">
            {breadcrumbItems.map((item, index) => {
              const isLast = index === breadcrumbItems.length - 1;

              return (
                <div className="flex items-center gap-2" key={`${item.label}-${index}`}>
                  {item.href && !isLast ? (
                    <Link
                      className="hover:text-accent-blue cursor-pointer transition-colors"
                      href={item.href}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "text-accent-blue drop-shadow-[0_0_5px_rgba(59,130,246,0.3)]"
                          : "hover:text-accent-blue cursor-pointer transition-colors"
                      }
                    >
                      {item.label}
                    </span>
                  )}
                  {isLast ? null : (
                    <span className="material-symbols-outlined text-[10px] text-slate-700">
                      chevron_right
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {children}
        </div>

        
      </main>
    </div>
  );
}
