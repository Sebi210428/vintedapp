"use client";

import { useState } from "react";

type PlanKey = "basic" | "pro" | "studio";

const plans: Array<{
  key: PlanKey;
  name: string;
  priceLabel: string;
  highlight?: boolean;
}> = [
  { key: "basic", name: "Basic", priceLabel: "€14.99 / month" },
  { key: "pro", name: "Pro", priceLabel: "€29.99 / month", highlight: true },
  { key: "studio", name: "Studio", priceLabel: "€59.99 / month" },
];

type Props = {
  currentPlanKey?: PlanKey | null;
  planStatus?: string | null;
  hasStripeCustomer?: boolean;
};

export default function StripeBillingActions({
  currentPlanKey,
  planStatus,
  hasStripeCustomer,
}: Props) {
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout(planKey: PlanKey) {
    setError(null);
    setLoadingPlan(planKey);
    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan: planKey }),
      });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string };
      if (!response.ok || !data?.url) {
        setError(data?.error ?? "Checkout failed. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Checkout failed. Please try again.");
    } finally {
      setLoadingPlan(null);
    }
  }

  async function openPortal() {
    setError(null);
    setLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await response.json().catch(() => null)) as { url?: string; error?: string };
      if (!response.ok || !data?.url) {
        setError(data?.error ?? "Portal unavailable. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Portal unavailable. Please try again.");
    } finally {
      setLoadingPortal(false);
    }
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Billing</h3>
          <p className="text-xs text-slate-400 mt-1">3-day free trial on all plans.</p>
        </div>
        {hasStripeCustomer ? (
          <button
            className="text-xs font-semibold text-accent-blue hover:text-white transition-colors"
            disabled={loadingPortal}
            onClick={() => void openPortal()}
            type="button"
          >
            {loadingPortal ? "Opening..." : "Manage billing"}
          </button>
        ) : null}
      </div>

      <div className="mt-4 grid gap-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanKey === plan.key;
          const isLoading = loadingPlan === plan.key;
          return (
            <div
              className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 transition-colors ${
                plan.highlight
                  ? "border-blue-500/40 bg-blue-500/10"
                  : "border-white/10 bg-white/5"
              }`}
              key={plan.key}
            >
              <div>
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  {plan.name}
                  {isCurrent ? (
                    <span className="text-[10px] uppercase tracking-widest text-emerald-300">
                      Current
                    </span>
                  ) : null}
                </div>
                <div className="text-[11px] text-slate-400">{plan.priceLabel}</div>
              </div>
              <button
                className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-white/20 disabled:opacity-60"
                disabled={isCurrent || isLoading}
                onClick={() => void startCheckout(plan.key)}
                type="button"
              >
                {isCurrent ? planStatus ?? "Active" : isLoading ? "Loading..." : "Choose"}
              </button>
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-200">
          {error}
        </div>
      ) : null}
    </div>
  );
}
