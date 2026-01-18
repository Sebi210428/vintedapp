"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";

const STORAGE_KEY = "bluecut_cookie_notice_v1";
const COOKIE_NAME = "bluecut_cookie_notice";

function hasConsentStored() {
  if (typeof document === "undefined") return true;
  if (typeof window !== "undefined") {
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return true;
    } catch {
      // ignore
    }
  }
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${COOKIE_NAME}=`));
}

function persistConsent() {
  if (typeof document === "undefined") return;

  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore
  }

  const maxAgeSeconds = 180 * 24 * 60 * 60; // ~6 months
  document.cookie = `${COOKIE_NAME}=1; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`;
}

function subscribe() {
  return () => {};
}

function getConsentSnapshot() {
  return hasConsentStored() ? "1" : "0";
}

function getConsentServerSnapshot() {
  return "1";
}

export default function CookieNotice() {
  const consent = useSyncExternalStore(subscribe, getConsentSnapshot, getConsentServerSnapshot);
  const [dismissed, setDismissed] = useState(false);
  const open = !dismissed && consent !== "1";

  if (!open) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] max-w-[calc(100vw-2rem)]">
      <div className="w-[340px] max-w-full rounded-2xl border border-white/10 bg-[#05080f]/95 backdrop-blur shadow-2xl">
        <div className="flex flex-col gap-3 p-4">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 text-slate-200 border border-white/10">
              <span className="material-symbols-outlined text-[18px]">cookie</span>
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-white">Cookie notice</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-300">
                BlueCut uses essential cookies to keep you signed in and protect your
                account. We don&apos;t use marketing cookies.
              </p>
              <div className="mt-2 text-xs text-slate-400">
                <Link className="underline hover:text-white" href="/privacy-policy">
                  Learn more
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              className="h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm font-semibold text-slate-200 hover:bg-white/10 hover:text-white transition-colors"
              onClick={() => setDismissed(true)}
              type="button"
            >
              Dismiss
            </button>
            <button
              className="h-10 rounded-xl bg-primary px-4 text-sm font-bold text-white hover:bg-blue-600 transition-colors"
              onClick={() => {
                persistConsent();
                setDismissed(true);
              }}
              type="button"
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
