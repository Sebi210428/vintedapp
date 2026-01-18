import type { NextAuthOptions } from "next-auth";

import bcrypt from "bcryptjs";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import prisma from "@/lib/prisma";
import {
  clearLoginRateLimit,
  getClientIpFromHeaders,
  getLoginRateLimitStatus,
  recordFailedLoginAttempt,
} from "@/lib/loginRateLimit";
import { getRateLimitStatus, recordRateLimitHit } from "@/lib/requestRateLimit";

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

export const authOptions: NextAuthOptions = {
  providers: [
    ...(googleClientId && googleClientSecret
      ? [
          GoogleProvider({
            clientId: googleClientId,
            clientSecret: googleClientSecret,
          }),
        ]
      : []),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (typeof email !== "string" || typeof password !== "string") return null;

        const normalizedEmail = email.toLowerCase();
        const clientIp = getClientIpFromHeaders(req?.headers);

        if (clientIp) {
          recordRateLimitHit(`login-ip|${clientIp}`, {
            maxHits: 30,
            windowMs: 10 * 60 * 1000,
            blockMs: 15 * 60 * 1000,
          });
          const ipStatus = getRateLimitStatus(`login-ip|${clientIp}`, {
            maxHits: 30,
            windowMs: 10 * 60 * 1000,
            blockMs: 15 * 60 * 1000,
          });
          if (!ipStatus.allowed) {
            throw new Error("TooManyAttempts");
          }
        }

        const rateLimit = getLoginRateLimitStatus(normalizedEmail, clientIp);
        if (!rateLimit.allowed) {
          throw new Error("TooManyAttempts");
        }

        const user = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        if (!user) {
          recordFailedLoginAttempt(normalizedEmail, clientIp);
          return null;
        }

        if (!user.passwordHash) {
          recordFailedLoginAttempt(normalizedEmail, clientIp);
          return null;
        }

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) {
          recordFailedLoginAttempt(normalizedEmail, clientIp);
          return null;
        }

        clearLoginRateLimit(normalizedEmail, clientIp);
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? undefined,
        };
      },
    }),
  ],
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  jwt: { maxAge: 30 * 24 * 60 * 60 },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (account?.provider === "google") {
        const emailRaw =
          (typeof token.email === "string" ? token.email : null) ??
          (typeof user?.email === "string" ? user.email : null) ??
          (typeof (profile as { email?: unknown } | undefined)?.email === "string"
            ? (profile as { email: string }).email
            : null);

        if (emailRaw) {
          const email = emailRaw.trim().toLowerCase();
          const name = typeof user?.name === "string" ? user.name.trim() : null;

          const dbUser = await prisma.user.upsert({
            where: { email },
            update: {
              name: name && name.length ? name : undefined,
            },
            create: {
              email,
              name: name && name.length ? name : null,
              passwordHash: null,
              credits: 2000,
              creditsTotal: 2000,
              planName: "Free Plan",
              planStatus: "Inactive",
            },
            select: { id: true, email: true, name: true },
          });

          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name ?? token.name;
        }
      } else if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) session.user.id = token.id as string;
      return session;
    },
  },
};
