"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  initialPreferredLanguage: string;
  initialTimezone: string;
  initialOutputFormat: string;
  initialDefaultQuality: number;
  initialAllowUsageData: boolean;
  initialPublicProfile: boolean;
};

type SaveState = "idle" | "saving" | "saved";

const outputFormats = ["PNG", "JPG", "WEBP"] as const;

function clampInt(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.floor(value)));
}

type QualitySliderProps = {
  value: number;
  min: number;
  max: number;
  onCommit: (value: number) => void;
};

function QualitySlider({ value, min, max, onCommit }: QualitySliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  function commit() {
    onCommit(clampInt(localValue, min, max));
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end">
        <label className="text-xs font-semibold text-slate-400">
          Default Quality
        </label>
        <span className="text-xs font-bold text-accent-blue bg-accent-blue/10 px-2 py-1 rounded border border-accent-blue/20">
          {localValue}%
        </span>
      </div>
      <div className="relative w-full h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-navy-light rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-accent-blue"
            style={{ width: `${localValue}%`, willChange: "width" }}
          />
        </div>
        <input
          className="w-full absolute opacity-0 cursor-pointer h-full z-10"
          max={max}
          min={min}
          onBlur={commit}
          onChange={(e) =>
            setLocalValue(clampInt(Number(e.target.value), min, max))
          }
          onKeyUp={commit}
          onPointerCancel={commit}
          onPointerUp={commit}
          style={{ touchAction: "pan-y" }}
          type="range"
          value={localValue}
        />
        <div
          className="absolute w-4 h-4 bg-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)] border-2 border-accent-blue -ml-2 pointer-events-none"
          style={{ left: `${localValue}%`, willChange: "left" }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-slate-600 font-medium uppercase tracking-wider">
        <span>Low</span>
        <span>High</span>
      </div>
    </div>
  );
}

export default function PreferencesForm({
  initialPreferredLanguage,
  initialTimezone,
  initialOutputFormat,
  initialDefaultQuality,
  initialAllowUsageData,
  initialPublicProfile,
}: Props) {
  const [preferredLanguage, setPreferredLanguage] = useState(
    initialPreferredLanguage || "en",
  );
  const [timezone, setTimezone] = useState(initialTimezone || "UTC");
  const [outputFormat, setOutputFormat] = useState(
    outputFormats.includes(initialOutputFormat as never)
      ? initialOutputFormat
      : "PNG",
  );
  const [defaultQuality, setDefaultQuality] = useState(
    clampInt(initialDefaultQuality || 90, 10, 100),
  );
  const [allowUsageData, setAllowUsageData] = useState(initialAllowUsageData);
  const [publicProfile, setPublicProfile] = useState(initialPublicProfile);

  const [error, setError] = useState<string | null>(null);
  const [state, setState] = useState<SaveState>("idle");

  const isDirty = useMemo(() => {
    return (
      preferredLanguage !== (initialPreferredLanguage || "en") ||
      timezone !== (initialTimezone || "UTC") ||
      outputFormat !==
        (outputFormats.includes(initialOutputFormat as never)
          ? initialOutputFormat
          : "PNG") ||
      defaultQuality !== clampInt(initialDefaultQuality || 90, 10, 100) ||
      allowUsageData !== initialAllowUsageData ||
      publicProfile !== initialPublicProfile
    );
  }, [
    allowUsageData,
    defaultQuality,
    initialAllowUsageData,
    initialDefaultQuality,
    initialOutputFormat,
    initialPreferredLanguage,
    initialPublicProfile,
    initialTimezone,
    outputFormat,
    preferredLanguage,
    publicProfile,
    timezone,
  ]);

  function onDiscard() {
    setPreferredLanguage(initialPreferredLanguage || "en");
    setTimezone(initialTimezone || "UTC");
    setOutputFormat(
      outputFormats.includes(initialOutputFormat as never)
        ? initialOutputFormat
        : "PNG",
    );
    setDefaultQuality(clampInt(initialDefaultQuality || 90, 10, 100));
    setAllowUsageData(initialAllowUsageData);
    setPublicProfile(initialPublicProfile);
    setError(null);
    setState("idle");
  }

  async function onSave() {
    setError(null);
    setState("saving");
    try {
      const response = await fetch("/api/account/preferences", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          preferredLanguage,
          timezone,
          outputFormat,
          defaultQuality,
          allowUsageData,
          publicProfile,
        }),
      });

      const body = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string }
        | null;
      if (!response.ok || !body?.ok) {
        setError(body?.error ?? "Couldn't save preferences. Please try again.");
        setState("idle");
        return;
      }

      setState("saved");
      window.setTimeout(() => setState("idle"), 1200);
    } catch {
      setError("Couldn't save preferences. Please try again.");
      setState("idle");
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto w-full pb-10">
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute inset-0 bg-grid-blue opacity-10 mask-image-gradient pointer-events-none" />
          <div className="absolute top-0 right-0 p-6 opacity-5 rotate-12 transition-transform group-hover:rotate-0 duration-700">
            <span className="material-symbols-outlined text-[120px] text-accent-blue">
              tune
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-6 relative z-10 flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-accent-blue/10 border border-accent-blue/20 flex items-center justify-center text-accent-blue">
              <span className="material-symbols-outlined text-lg">settings</span>
            </span>
            General Settings
          </h3>

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  Interface Language
                </label>
                <div className="relative group/select">
                  <select
                    className="w-full bg-navy-light border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent-blue focus:border-accent-blue/50 outline-none appearance-none transition-colors hover:border-white/20"
                    onChange={(e) => setPreferredLanguage(e.target.value)}
                    value={preferredLanguage}
                  >
                    <option value="en">English</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-500 pointer-events-none text-[20px] group-hover/select:text-accent-blue transition-colors">
                    expand_more
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-400">
                  Timezone
                </label>
                <div className="relative group/select">
                  <select
                    className="w-full bg-navy-light border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:ring-1 focus:ring-accent-blue focus:border-accent-blue/50 outline-none appearance-none transition-colors hover:border-white/20"
                    onChange={(e) => setTimezone(e.target.value)}
                    value={timezone}
                  >
                    <option value="UTC">(UTC) UTC</option>
                    <option value="Europe/Bucharest">(GMT+02:00) Bucharest</option>
                    <option value="Europe/London">(GMT+00:00) London</option>
                    <option value="America/New_York">(GMT-05:00) New York</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-3 text-slate-500 pointer-events-none text-[20px] group-hover/select:text-accent-blue transition-colors">
                    expand_more
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-white/5 to-transparent w-full my-4" />

            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-white">Output Format</div>
                  <div className="text-[11px] text-slate-500">
                    Default format for downloaded results.
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {outputFormats.map((format) => (
                  <label className="cursor-pointer group" key={format}>
                    <input
                      checked={outputFormat === format}
                      className="peer sr-only"
                      name="format"
                      onChange={() => setOutputFormat(format)}
                      type="radio"
                    />
                    <div className="rounded-xl border border-white/10 bg-navy-light p-4 text-center transition-all duration-300 peer-checked:border-accent-blue peer-checked:bg-accent-blue/10 peer-checked:text-accent-blue peer-checked:shadow-[0_0_15px_rgba(59,130,246,0.15)] group-hover:border-white/20">
                      <span className="block text-sm font-bold mb-1">{format}</span>
                      <span className="block text-[10px] text-slate-500 peer-checked:text-accent-blue/70">
                        {format === "PNG"
                          ? "Lossless"
                          : format === "JPG"
                            ? "Compressed"
                            : "Optimized"}
                      </span>
                    </div>
                  </label>
                ))}
              </div>

              <QualitySlider
                max={100}
                min={10}
                onCommit={(value) => setDefaultQuality(value)}
                value={defaultQuality}
              />
            </div>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[20px]">
              shield
            </span>
            Privacy
          </h3>
          <div className="space-y-4">
            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5 relative">
                <input
                  checked={allowUsageData}
                  className="rounded-md border-white/10 bg-navy-light text-accent-blue focus:ring-offset-0 focus:ring-accent-blue/50 w-5 h-5 transition-colors"
                  onChange={(e) => setAllowUsageData(e.target.checked)}
                  type="checkbox"
                />
              </div>
              <div>
                <p className="text-xs text-slate-200 font-medium group-hover:text-accent-blue transition-colors">
                  Allow anonymous usage analytics
                </p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Helps us understand performance and improve the product.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer group">
              <div className="mt-0.5 relative">
                <input
                  checked={publicProfile}
                  className="rounded-md border-white/10 bg-navy-light text-accent-blue focus:ring-offset-0 focus:ring-accent-blue/50 w-5 h-5 transition-colors"
                  onChange={(e) => setPublicProfile(e.target.checked)}
                  type="checkbox"
                />
              </div>
              <div>
                <p className="text-xs text-slate-200 font-medium group-hover:text-accent-blue transition-colors">
                  Public profile visibility
                </p>
                <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                  Allows your profile to be visible when team features are enabled.
                </p>
              </div>
            </label>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        <div className="pt-6">
          <button
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-primary to-accent-blue text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] border border-white/10 relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!isDirty || state === "saving"}
            onClick={onSave}
            type="button"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-[18px]">save</span>
              {state === "saving"
                ? "Saving..."
                : state === "saved"
                  ? "Saved"
                  : "Save Changes"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </button>
          <button
            className="w-full py-3.5 mt-3 rounded-xl bg-transparent text-slate-400 hover:text-white text-sm font-semibold transition-colors hover:bg-white/5 border border-transparent hover:border-white/5 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={!isDirty || state === "saving"}
            onClick={onDiscard}
            type="button"
          >
            Discard Changes
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="glass-panel rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-b from-accent-blue/5 to-transparent opacity-50" />
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-blue/10 border border-accent-blue/20 text-accent-blue">
              <span className="material-symbols-outlined text-[22px]">manage_accounts</span>
            </div>
            <h3 className="text-white font-bold text-lg">Account</h3>
            <p className="text-slate-400 text-xs mb-5">
              Manage your profile and password.
            </p>
            <Link
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-accent-blue/10 border border-white/10 hover:border-accent-blue/30 text-xs font-semibold text-white hover:text-accent-blue transition-all w-full relative z-10 flex items-center justify-center gap-2"
              href="/dashboard/account"
            >
              <span className="material-symbols-outlined text-[16px]">
                manage_accounts
              </span>
              Manage Account
            </Link>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6">
          <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-accent-blue text-[20px]">
              help
            </span>
            Help Center
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Find answers about uploads, output formats, and troubleshooting.
          </p>
          <Link
            className="mt-4 inline-flex items-center justify-center gap-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/10 transition-colors"
            href="/help-center"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Open Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
