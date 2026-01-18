import { NextRequest, NextResponse } from "next/server";

import { getServerAuthSession } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { getAppUrl, getStripeClient } from "@/lib/stripe";
import { getStripePlanByKey, type StripePlanKey } from "@/lib/stripePlans";

export const runtime = "nodejs";

type CheckoutPayload = {
  plan?: StripePlanKey;
};

export async function POST(request: NextRequest) {
  const session = await getServerAuthSession();
  const email = session?.user?.email?.toLowerCase() ?? null;
  if (!email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const payload = (await request.json().catch(() => null)) as CheckoutPayload | null;
  const planKey = payload?.plan;
  if (!planKey || !["basic", "pro", "studio"].includes(planKey)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const plan = getStripePlanByKey(planKey);
  if (!plan) {
    return NextResponse.json({ error: "Plan is not configured" }, { status: 500 });
  }

  const stripe = getStripeClient();
  let customerId = user.stripeCustomerId ?? null;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id },
    });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const trialRaw = process.env.STRIPE_TRIAL_DAYS;
  const trialDays = trialRaw ? Number(trialRaw) : 3;
  const trialPeriodDays = Number.isFinite(trialDays) && trialDays > 0 ? Math.floor(trialDays) : 0;

  const appUrl = getAppUrl();
  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    allow_promotion_codes: true,
    client_reference_id: user.id,
    metadata: { userId: user.id, planKey: plan.key },
    subscription_data: {
      trial_period_days: trialPeriodDays || undefined,
      metadata: { userId: user.id, planKey: plan.key },
    },
    success_url: `${appUrl}/dashboard/account?stripe=success`,
    cancel_url: `${appUrl}/dashboard/account?stripe=cancel`,
  });

  return NextResponse.json({ url: checkout.url });
}
