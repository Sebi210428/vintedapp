import type Stripe from "stripe";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { getStripeClient, getStripeWebhookSecret } from "@/lib/stripe";
import { getStripePlanByPriceId } from "@/lib/stripePlans";

export const runtime = "nodejs";

function formatPlanStatus(status: Stripe.Subscription.Status, cancelAtPeriodEnd: boolean) {
  if (cancelAtPeriodEnd && status === "active") return "Canceling";
  if (status === "trialing") return "Trialing";
  if (status === "active") return "Active";
  if (status === "past_due") return "Past due";
  if (status === "unpaid") return "Unpaid";
  if (status === "paused") return "Paused";
  if (status === "incomplete") return "Incomplete";
  if (status === "incomplete_expired") return "Expired";
  if (status === "canceled") return "Canceled";
  return "Inactive";
}

async function upsertSubscriptionForUser(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const priceId = subscription.items.data[0]?.price?.id ?? null;
  const plan = getStripePlanByPriceId(priceId);
  const planName = plan?.name ?? "Subscription";

  const planStatus = formatPlanStatus(subscription.status, subscription.cancel_at_period_end);
  const data = {
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscription.id,
    stripePriceId: priceId,
    planName,
    planStatus,
  };

  const metadataUserId = subscription.metadata?.userId;
  const user =
    (metadataUserId
      ? await prisma.user.findUnique({ where: { id: metadataUserId } })
      : null) ??
    (customerId
      ? await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
      : null);

  if (user) {
    await prisma.user.update({ where: { id: user.id }, data });
  }
}

async function clearSubscriptionForUser(subscription: Stripe.Subscription) {
  const customerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const metadataUserId = subscription.metadata?.userId;
  const user =
    (metadataUserId
      ? await prisma.user.findUnique({ where: { id: metadataUserId } })
      : null) ??
    (customerId
      ? await prisma.user.findFirst({ where: { stripeCustomerId: customerId } })
      : null);

  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeSubscriptionId: null,
        stripePriceId: null,
        planName: "Free Plan",
        planStatus: "Canceled",
      },
    });
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const customerId =
    typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const metadataUserId = session.metadata?.userId ?? session.client_reference_id ?? null;

  if (!customerId || !metadataUserId) return;

  const user = await prisma.user.findUnique({ where: { id: metadataUserId } });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        stripeCustomerId: customerId,
        ...(subscriptionId ? { stripeSubscriptionId: subscriptionId } : {}),
      },
    });
  }

  if (subscriptionId) {
    const stripe = getStripeClient();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    await upsertSubscriptionForUser(subscription);
  }
}

export async function POST(request: Request) {
  const stripe = getStripeClient();
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature" }, { status: 400 });
  }

  const payload = await request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
  } catch (error) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await upsertSubscriptionForUser(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await clearSubscriptionForUser(event.data.object as Stripe.Subscription);
        break;
      default:
        break;
    }
  } catch (error) {
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
