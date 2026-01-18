import { NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAppUrl, getStripeClient } from "@/lib/stripe";

export const runtime = "nodejs";

export async function POST() {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: "Stripe customer not found" }, { status: 400 });
  }

  const stripe = getStripeClient();
  const appUrl = getAppUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${appUrl}/dashboard/account`,
  });

  return NextResponse.json({ url: portal.url });
}
