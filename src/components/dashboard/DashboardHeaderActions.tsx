"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function DashboardHeaderActions() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current) return;
      if (containerRef.current.contains(event.target as Node)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="flex items-center gap-4" ref={containerRef}>
      <div className="relative">
        <button
          aria-expanded={open}
          aria-haspopup="menu"
          className="flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-accent-blue hover:bg-accent-blue/10 transition-all relative border border-transparent hover:border-accent-blue/20"
          onClick={() => setOpen((v) => !v)}
          type="button"
        >
          <span className="material-symbols-outlined text-[20px]">notifications</span>
        </button>

        {open ? (
          <div
            className="absolute right-0 mt-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl border border-white/10 bg-[#05080f]/95 shadow-2xl backdrop-blur p-3 z-50"
            role="menu"
          >
            <div className="px-2 py-2">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400">
                Notifications
              </div>
              <div className="mt-2 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
                No notifications yet.
                <div className="mt-2 text-xs text-slate-400">
                  Coming soon: you&apos;ll see processing updates here once the worker is connected.
                </div>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between gap-2 px-2 pb-2">
              <Link
                className="text-xs font-semibold text-accent-blue hover:text-white transition-colors"
                href="/dashboard/preferences"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Notification settings
              </Link>
              <Link
                className="text-xs font-semibold text-slate-300 hover:text-white transition-colors"
                href="/help-center"
                onClick={() => setOpen(false)}
                role="menuitem"
              >
                Help Center
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <Link
        className="flex items-center justify-center w-10 h-10 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
        href="/help-center"
        title="Help Center"
      >
        <span className="material-symbols-outlined text-[20px]">help</span>
      </Link>
    </div>
  );
}
