export type StripePlanKey = "basic" | "pro" | "studio";

export type StripePlan = {
  key: StripePlanKey;
  name: string;
  priceId: string;
  priceLabel: string;
};

const rawPlans: Record<StripePlanKey, StripePlan> = {
  basic: {
    key: "basic",
    name: "Basic Plan",
    priceId: process.env.STRIPE_PRICE_BASIC ?? "",
    priceLabel: "€14.99 / month",
  },
  pro: {
    key: "pro",
    name: "Pro Plan",
    priceId: process.env.STRIPE_PRICE_PRO ?? "",
    priceLabel: "€29.99 / month",
  },
  studio: {
    key: "studio",
    name: "Studio Plan",
    priceId: process.env.STRIPE_PRICE_STUDIO ?? "",
    priceLabel: "€59.99 / month",
  },
};

export function listStripePlans(): StripePlan[] {
  return Object.values(rawPlans).map((plan) => ({ ...plan }));
}

export function getStripePlanByKey(key: StripePlanKey): StripePlan | null {
  const plan = rawPlans[key];
  if (!plan?.priceId) return null;
  return { ...plan };
}

export function getStripePlanByPriceId(priceId: string | null | undefined): StripePlan | null {
  if (!priceId) return null;
  const match = Object.values(rawPlans).find((plan) => plan.priceId === priceId);
  return match ? { ...match } : null;
}
