import prisma from "@/lib/prisma";
import { getServerAuthSession } from "@/lib/auth";

export async function getCurrentUser() {
  const session = await getServerAuthSession();
  const email = session?.user?.email;
  if (!email) return null;

  return prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });
}

