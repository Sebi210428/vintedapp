"use client";

import type { FormEvent } from "react";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getProviders, signIn } from "next-auth/react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleEnabled, setGoogleEnabled] = useState(false);
  const [providersLoaded, setProvidersLoaded] = useState(false);

  useEffect(() => {
    const qsError =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("error")
        : null;
    if (!qsError) return;

    const message =
      qsError === "OAuthAccountNotLinked"
        ? "This email is already linked to a different sign-in method. Try logging in instead."
        : qsError === "AccessDenied"
          ? "Sign-up was denied. Please try again."
          : qsError === "Configuration"
            ? "Google sign-up is not configured. Please try again later."
            : "Couldn't sign up with Google. Please try again.";

    setError(message);
  }, []);

  useEffect(() => {
    getProviders()
      .then((providers) => setGoogleEnabled(Boolean(providers?.google)))
      .catch(() => setGoogleEnabled(false))
      .finally(() => setProvidersLoaded(true));
  }, []);

  function getPostAuthRedirect() {
    if (typeof window === "undefined") return "/dashboard";
    const params = new URLSearchParams(window.location.search);
    const callbackUrl = params.get("callbackUrl");
    const plan = params.get("plan");
    if (callbackUrl) return callbackUrl;
    if (plan) return `/dashboard/account?plan=${plan}`;
    return "/dashboard";
  }

  async function onGoogleSignUp() {
    setError(null);
    if (!googleEnabled) {
      setError(
        providersLoaded
          ? "Google login isn't configured. Set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET."
          : "Checking providers...",
      );
      return;
    }
    try {
      await signIn("google", { callbackUrl: getPostAuthRedirect() });
    } catch {
      setError("Couldn't sign up with Google. Please try again.");
    }
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "We couldn't create your account.");
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.ok) {
        router.replace(getPostAuthRedirect());
        return;
      }

      router.replace("/login");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#05070d] text-white">
      <Link
        className="group absolute left-4 top-4 z-20 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 backdrop-blur-sm transition-colors hover:bg-white/10 hover:text-white"
        href="/"
        replace
      >
        <span className="material-symbols-outlined text-lg transition-transform group-hover:-translate-x-0.5">
          arrow_back
        </span>
        Back to site
      </Link>

      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0c1222] to-[#02040a] opacity-85" />
        <div className="absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[140px]" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-center p-4 sm:p-8">
        <div className="flex w-full max-w-[420px] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1120]/80 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-[18px] animate-fade-in-up">
          <div className="px-6 pb-2 pt-8 text-center sm:px-8">
            <div className="mx-auto mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-slate-300">
              BlueCut
            </div>
            <h1 className="font-display text-2xl font-bold tracking-tight text-white">
              Create your account
            </h1>
            <p className="mt-2 font-display text-sm font-light text-slate-400">
              Start removing backgrounds in seconds
            </p>
          </div>

          <div className="flex flex-col gap-5 px-6 py-6 sm:px-8 sm:py-8">
            <button
              aria-disabled={!googleEnabled}
              className={`flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-white transition-colors ${
                googleEnabled ? "hover:bg-white/10" : "opacity-60 cursor-not-allowed"
              }`}
              disabled={!googleEnabled}
              onClick={onGoogleSignUp}
              title={
                googleEnabled
                  ? "Continue with Google"
                  : providersLoaded
                    ? "Google login isn't configured (set GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)."
                    : "Checking providers..."
              }
              type="button"
            >
              <span className="material-symbols-outlined text-[18px]">account_circle</span>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-slate-500">
              <span className="h-px flex-1 bg-white/10" />
              or
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <form className="flex flex-col gap-5" onSubmit={onSubmit}>
              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-xs font-medium text-slate-300" htmlFor="name">
                  Name <span className="font-light text-slate-500">(optional)</span>
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-primary">
                      person
                    </span>
                  </div>
                  <input
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1121] px-4 pl-10 pr-4 text-sm text-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.45)] placeholder:text-slate-600 outline-none transition-all focus:border-[#0d5df2] focus:shadow-[0_0_0_1px_#0d5df2]"
                    id="name"
                    name="name"
                    placeholder="John Doe"
                    type="text"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-xs font-medium text-slate-300" htmlFor="email">
                  Email
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-primary">
                      mail
                    </span>
                  </div>
                  <input
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1121] px-4 pl-10 pr-4 text-sm text-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.45)] placeholder:text-slate-600 outline-none transition-all focus:border-[#0d5df2] focus:shadow-[0_0_0_1px_#0d5df2]"
                    id="email"
                    name="email"
                    placeholder="name@company.com"
                    required
                    type="email"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="ml-1 text-xs font-medium text-slate-300" htmlFor="password">
                  Password
                </label>
                <div className="group relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-primary">
                      lock
                    </span>
                  </div>
                  <input
                    className="h-12 w-full rounded-xl border border-white/10 bg-[#0b1121] px-4 pl-10 pr-4 text-sm text-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.45)] placeholder:text-slate-600 outline-none transition-all focus:border-[#0d5df2] focus:shadow-[0_0_0_1px_#0d5df2]"
                    id="password"
                    name="password"
                    placeholder="Create a password"
                    required
                    type="password"
                  />
                </div>
              </div>

              {error ? (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                className="group mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d5df2] py-3 font-medium text-white shadow-[0_0_18px_-6px_rgba(13,93,242,0.6)] transition-all duration-200 hover:bg-blue-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
                type="submit"
              >
                <span>{submitting ? "Creating..." : "Create account"}</span>
                <span className="material-symbols-outlined text-[18px] transition-transform group-hover:translate-x-0.5">
                  arrow_forward
                </span>
              </button>
            </form>

            {error ? null : (
              <div className="text-center text-xs text-slate-500">
                By continuing, you agree to our{" "}
                <Link className="underline hover:text-white" href="/terms" target="_blank">
                  Terms
                </Link>{" "}
                and{" "}
                <Link
                  className="underline hover:text-white"
                  href="/privacy-policy"
                  target="_blank"
                >
                  Privacy Policy
                </Link>
                .
              </div>
            )}
          </div>

          <div className="border-t border-white/5 bg-[#0b1120]/50 px-6 py-5 text-center sm:px-8">
            <p className="text-sm text-slate-400">
              Already have an account?
              <Link
                className="ml-1 font-medium text-white underline decoration-primary/50 underline-offset-4 transition-all hover:text-primary hover:decoration-primary"
                href="/login"
                replace
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
