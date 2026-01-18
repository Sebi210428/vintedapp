"use client";

import type { FormEvent } from "react";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type RequestResponse = {
  resetLink?: string;
  emailSent?: boolean;
  emailReason?: string | null;
};

export default function ResetPasswordPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [debugLink, setDebugLink] = useState<string | null>(null);
  const [devNote, setDevNote] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const t =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("token")
        : null;
    setToken(t);
  }, []);

  const mode = useMemo(() => (token ? "confirm" : "request"), [token]);

  async function onRequestReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    setDebugLink(null);
    setDevNote(null);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        setError("Something went wrong. Please try again.");
        return;
      }

      const body = (await response.json().catch(() => null)) as RequestResponse | null;

      setSuccess("If an account exists for this email, we sent a reset link.");
      if (body?.resetLink) setDebugLink(body.resetLink);
      if (body?.emailSent === false && body.emailReason) {
        const note =
          body.emailReason === "smtp_not_configured"
            ? "Dev: SMTP isn't configured, so no email is sent (set SMTP_* in .env.local)."
            : "Dev: email sending failed (check SMTP_* in .env.local).";
        setDevNote(note);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function onConfirmReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirmPassword = String(formData.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      if (!token) {
        setError("Invalid token.");
        return;
      }

      const response = await fetch("/api/auth/password-reset/confirm", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        setError(body?.error ?? "We couldn't reset your password.");
        return;
      }

      setSuccess("Your password has been reset. You can log in now.");
      setTimeout(() => router.replace("/login"), 800);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0b0e14] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="pointer-events-none absolute -top-[10%] left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-blue-900/10 blur-[100px]" />
      </div>

      <div className="relative flex min-h-screen w-full flex-col items-center justify-center overflow-hidden p-4">
        <div className="z-20 mb-8 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-blue-600 shadow-[0_0_15px_rgba(13,93,242,0.4)]">
            <span className="material-symbols-outlined text-[28px] text-white">
              lock_reset
            </span>
          </div>
        </div>

        <div className="relative z-20 w-full max-w-[440px] overflow-hidden rounded-2xl border border-white/5 bg-[rgba(16,22,34,0.4)] shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] backdrop-blur-[20px]">
          <div className="px-8 pb-2 pt-10 text-center">
            {mode === "request" ? (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Reset your password
                </h1>
                <p className="mt-2 text-base font-normal leading-relaxed text-slate-400">
                  Enter the email associated with your account and we&apos;ll send a
                  link to reset your password.
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-white">
                  Choose a new password
                </h1>
                <p className="mt-2 text-base font-normal leading-relaxed text-slate-400">
                  Set a new password for your account.
                </p>
              </>
            )}
          </div>

          <div className="px-8 pb-10 pt-8">
            {mode === "request" ? (
              <form className="flex flex-col gap-6" onSubmit={onRequestReset}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="email">
                    Email Address
                  </label>
                  <div className="group relative">
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <span className="material-symbols-outlined text-[20px] text-slate-500 transition-colors group-focus-within:text-primary">
                        mail
                      </span>
                    </div>
                    <input
                      className="h-14 w-full rounded-lg border border-white/5 bg-[rgba(11,14,20,0.8)] px-4 pr-10 text-base text-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] placeholder:text-slate-600 transition-all duration-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                      id="email"
                      name="email"
                      placeholder="name@company.com"
                      required
                      type="email"
                    />
                  </div>
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}
                {success ? (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
                    {devNote ? (
                      <div className="mt-2 text-xs text-emerald-100/90">
                        {devNote}
                      </div>
                    ) : null}
                    {debugLink ? (
                      <div className="mt-2 break-all text-xs text-emerald-100/90">
                        Dev link:{" "}
                        <a className="underline" href={debugLink}>
                          {debugLink}
                        </a>
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <button
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-primary text-base font-bold text-white shadow-[0_0_20px_rgba(13,93,242,0.5)] transition-all duration-300 hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(13,93,242,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? "Sending..." : "Send reset link"}
                    <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </form>
            ) : (
              <form className="flex flex-col gap-6" onSubmit={onConfirmReset}>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-300" htmlFor="password">
                    New Password
                  </label>
                  <input
                    className="h-14 w-full rounded-lg border border-white/5 bg-[rgba(11,14,20,0.8)] px-4 text-base text-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] placeholder:text-slate-600 transition-all duration-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    id="password"
                    name="password"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    className="text-sm font-medium text-slate-300"
                    htmlFor="confirmPassword"
                  >
                    Confirm Password
                  </label>
                  <input
                    className="h-14 w-full rounded-lg border border-white/5 bg-[rgba(11,14,20,0.8)] px-4 text-base text-white shadow-[inset_0_2px_4px_0_rgba(0,0,0,0.3)] placeholder:text-slate-600 transition-all duration-200 focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                    id="confirmPassword"
                    name="confirmPassword"
                    placeholder="••••••••"
                    required
                    type="password"
                  />
                </div>

                {error ? (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                ) : null}
                {success ? (
                  <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                    {success}
                  </div>
                ) : null}

                <button
                  className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-lg bg-primary text-base font-bold text-white shadow-[0_0_20px_rgba(13,93,242,0.5)] transition-all duration-300 hover:bg-blue-600 hover:shadow-[0_0_30px_rgba(13,93,242,0.6)] disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={submitting}
                  type="submit"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    {submitting ? "Saving..." : "Reset password"}
                    <span className="material-symbols-outlined text-sm transition-transform duration-300 group-hover:translate-x-1">
                      arrow_forward
                    </span>
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="mt-8 text-xs text-slate-500">
          <Link
            className="inline-flex items-center gap-2 hover:text-white"
            href="/login"
            replace
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
