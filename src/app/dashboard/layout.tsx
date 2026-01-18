import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await getServerAuthSession();
  if (!session) redirect("/login");

  return children;
}
