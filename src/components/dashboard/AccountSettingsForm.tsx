"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  initialFirstName: string;
  initialLastName: string;
  email: string;
  initialNotifyProductUpdates: boolean;
  initialNotifySecurityAlerts: boolean;
};

type SaveState = "idle" | "saving" | "saved";

export default function AccountSettingsForm({
  initialFirstName,
  initialLastName,
  email,
  initialNotifyProductUpdates,
  initialNotifySecurityAlerts,
}: Props) {
  const [firstName, setFirstName] = useState(initialFirstName);
  const [lastName, setLastName] = useState(initialLastName);
  const [notifyProductUpdates, setNotifyProductUpdates] = useState(
    initialNotifyProductUpdates,
  );
  const [notifySecurityAlerts, setNotifySecurityAlerts] = useState(
    initialNotifySecurityAlerts,
  );

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>("idle");

  const canSave = useMemo(() => state !== "saving", [state]);

  async function onSave() {
    setError(null);

    if (newPassword.length || confirmPassword.length) {
      if (newPassword !== confirmPassword) {
        setError("New password and confirmation do not match.");
        return;
      }
      if (newPassword.length > 0 && newPassword.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (!currentPassword.length) {
        setError("Current password is required to change your password.");
        return;
      }
    }

    setState("saving");
    try {
      const response = await fetch("/api/account/settings", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          currentPassword: currentPassword.length ? currentPassword : undefined,
          newPassword: newPassword.length ? newPassword : undefined,
          notifyProductUpdates,
          notifySecurityAlerts,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;

      if (!response.ok || !body?.ok) {
        setError(body?.error ?? "Couldn't save changes. Please try again.");
        setState("idle");
        return;
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setState("saved");
      window.setTimeout(() => setState("idle"), 1400);
    } catch {
      setError("Couldn't save changes. Please try again.");
      setState("idle");
    }
  }

  return (
    <div className="space-y-8">
      <div className="glass-panel rounded-2xl p-8 border border-white/5 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 via-transparent to-transparent opacity-50" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-1">
                Profile Information
              </h2>
              <p className="text-slate-400 text-xs">
                Update your personal details and security settings.
              </p>
            </div>
            <button
              className="px-4 py-2 rounded-lg bg-accent-primary/10 border border-accent-primary/20 text-accent-blue text-xs font-semibold hover:bg-accent-primary/20 hover:border-accent-primary/40 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={!canSave}
              onClick={onSave}
              type="button"
            >
              <span className="material-symbols-outlined text-[16px]">save</span>
              {state === "saving" ? "Saving..." : state === "saved" ? "Saved" : "Save Changes"}
            </button>
          </div>

          <div className="flex flex-col md:flex-row gap-8 items-start mb-8 pb-8 border-b border-white/5">
            <div className="flex-1 w-full space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    First Name
                  </label>
                  <input
                    className="w-full bg-[#02040a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all placeholder:text-slate-600"
                    onChange={(event) => setFirstName(event.target.value)}
                    type="text"
                    value={firstName}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                    Last Name
                  </label>
                  <input
                    className="w-full bg-[#02040a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all placeholder:text-slate-600"
                    onChange={(event) => setLastName(event.target.value)}
                    type="text"
                    value={lastName}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Email Address
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3.5 top-2.5 text-slate-600 text-[18px]">
                    mail
                  </span>
                  <input
                    className="w-full bg-[#02040a] border border-white/10 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white opacity-80 cursor-not-allowed"
                    disabled
                    readOnly
                    type="email"
                    value={email}
                  />
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-accent-blue text-[18px]">
                lock
              </span>
              Security
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Current Password
                </label>
                <input
                  className="w-full bg-[#02040a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all placeholder:text-slate-600"
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={currentPassword}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  New Password
                </label>
                <input
                  className="w-full bg-[#02040a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all placeholder:text-slate-600"
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={newPassword}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
                  Confirm Password
                </label>
                <input
                  className="w-full bg-[#02040a] border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/50 transition-all placeholder:text-slate-600"
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={confirmPassword}
                />
              </div>
            </div>
          </div>

          {error ? (
            <div className="mt-6 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}
        </div>
      </div>

      <div className="glass-panel rounded-2xl p-8 border border-white/5 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-white mb-1">Notifications</h2>
            <p className="text-slate-400 text-xs">
              Choose which emails you want to receive. (Delivery is coming soon.)
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent-blue/20 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                <span className="material-symbols-outlined text-[20px]">
                  mark_email_unread
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-white group-hover:text-accent-blue transition-colors">
                  Product updates
                </div>
                <div className="text-xs text-slate-500">
                  Occasional updates about new features and improvements.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={notifyProductUpdates}
                className="sr-only peer"
                onChange={(event) => setNotifyProductUpdates(event.target.checked)}
                type="checkbox"
              />
              <div className="w-9 h-5 bg-navy-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-white peer-checked:after:border-white" />
            </label>
          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-accent-blue/20 transition-all group">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-blue/10 text-accent-blue">
                <span className="material-symbols-outlined text-[20px]">
                  security
                </span>
              </div>
              <div>
                <div className="text-sm font-medium text-white group-hover:text-accent-blue transition-colors">
                  Security alerts
                </div>
                <div className="text-xs text-slate-500">
                  Account and security notifications.
                </div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                checked={notifySecurityAlerts}
                className="sr-only peer"
                onChange={(event) => setNotifySecurityAlerts(event.target.checked)}
                type="checkbox"
              />
              <div className="w-9 h-5 bg-navy-light peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-accent-primary peer-checked:after:bg-white peer-checked:after:border-white" />
            </label>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-gradient-to-br from-accent-primary/10 to-transparent border border-accent-primary/10 text-center">
        <div className="w-10 h-10 mx-auto bg-accent-primary/20 rounded-full flex items-center justify-center mb-3 text-accent-blue">
          <span className="material-symbols-outlined text-[20px]">support_agent</span>
        </div>
        <h4 className="text-white text-sm font-bold mb-1">Need help?</h4>
        <p className="text-slate-400 text-xs mb-3">
          Visit the Help Center for answers and troubleshooting.
        </p>
        <Link
          className="text-accent-blue text-xs font-semibold hover:text-white transition-colors"
          href="/help-center"
        >
          Visit Help Center
        </Link>
      </div>
    </div>
  );
}
