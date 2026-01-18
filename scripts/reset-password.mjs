import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const [, , emailArg, passwordArg] = process.argv;
const email = (emailArg ?? "").trim().toLowerCase();
const newPassword = passwordArg ?? process.env.NEW_PASSWORD ?? "";

if (!email || !email.includes("@")) {
  console.error("Usage: node scripts/reset-password.mjs <email> <newPassword>");
  console.error("   or: NEW_PASSWORD=... node scripts/reset-password.mjs <email>");
  process.exit(1);
}

if (typeof newPassword !== "string" || newPassword.length < 6) {
  console.error("New password must be at least 6 characters.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`No user found for email: ${email}`);
    process.exitCode = 1;
  } else {
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { email }, data: { passwordHash } });
    console.log(`Password updated for ${email}`);
  }
} finally {
  await prisma.$disconnect();
}

