"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function percentFromClientX(clientX: number, rect: DOMRect) {
  if (rect.width <= 0) return 0.5;
  return clamp01((clientX - rect.left) / rect.width);
}

export default function DemoPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0.5);
  const [beforeError, setBeforeError] = useState(false);
  const [afterError, setAfterError] = useState(false);
  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(0);

  const beforeCandidates = [
    "/demo/before.jpg",
    "/demo/before.jpeg",
    "/demo/before.png",
    "/demo/before.webp",
  ] as const;
  const afterCandidates = [
    "/demo/after.jpg",
    "/demo/after.jpeg",
    "/demo/after.png",
    "/demo/after.webp",
  ] as const;

  const beforeSrc = beforeCandidates[beforeIndex] ?? beforeCandidates[0];
  const afterSrc = afterCandidates[afterIndex] ?? afterCandidates[0];

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (typeof window !== "undefined" && window.history.length > 1) {
          router.back();
          return;
        }
        router.push("/");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  const updateFromClientX = (clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setProgress(percentFromClientX(clientX, rect));
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!containerRef.current) return;
    containerRef.current.setPointerCapture(event.pointerId);
    setDragging(true);
    updateFromClientX(event.clientX);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!dragging) return;
    updateFromClientX(event.clientX);
  };

  const onPointerUpOrCancel = () => setDragging(false);
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.1 : 0.02;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setProgress((value) => clamp01(value - step));
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      setProgress((value) => clamp01(value + step));
    }
  };
  const onTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    if (!touch) return;
    setDragging(true);
    updateFromClientX(touch.clientX);
  };
  const onTouchMove = (event: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const touch = event.touches[0];
    if (!touch) return;
    updateFromClientX(touch.clientX);
  };
  const onTouchEnd = () => setDragging(false);

  const percent = Math.round(progress * 100);
  const clipRightPercent = 100 - percent;

  return (
    <main className="bg-[#020617] font-display min-h-screen flex flex-col selection:bg-primary selection:text-white">
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-800/10 rounded-full blur-[150px]" />
        <div className="absolute inset-0 bg-[url('/textures/carbon-fibre.png')] opacity-[0.03]" />
      </div>

      <div className="flex-1 w-full relative z-10 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="relative w-full max-w-5xl animate-fade-in-up flex flex-col">
          <div className="demo-glass-panel rounded-2xl overflow-hidden flex flex-col ring-1 ring-white/10 shadow-2xl relative w-full">
            <div className="flex items-center justify-between px-6 py-4 bg-[#0b1120] border-b border-blue-900/30">
              <Link
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                href="/"
              >
                <span className="material-symbols-outlined text-lg">arrow_back</span>
                Back to site
              </Link>
            </div>

            <div
              className="relative w-full aspect-[4/3] md:aspect-[16/9] lg:aspect-[2.35/1] max-h-[65vh] bg-[#020617] group select-none overflow-hidden"
              ref={containerRef}
              onPointerCancel={onPointerUpOrCancel}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUpOrCancel}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onKeyDown={onKeyDown}
              role="slider"
              tabIndex={0}
              aria-label="Before and after comparison"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              style={{
                cursor: dragging ? "grabbing" : "ew-resize",
                touchAction: "none",
              }}
            >
              {beforeError || afterError ? (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020617]/70 px-6 text-center">
                  <div className="max-w-xl rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-slate-200 backdrop-blur">
                    <div className="mb-2 text-base font-bold text-white">
                      Demo images missing
                    </div>
                    <p className="text-slate-300">
                      Add your files to{" "}
                      <span className="font-mono">vinted-next/public/demo/</span>{" "}
                      named{" "}
                      <span className="font-mono">before.(jpg|jpeg|png|webp)</span>{" "}
                      and{" "}
                      <span className="font-mono">after.(jpg|jpeg|png|webp)</span>,
                      then refresh.
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="absolute inset-0 w-full h-full demo-tech-grid z-0">
                <Image
                  alt="After image"
                  className="object-cover object-center opacity-100 scale-[1.02] transition-transform duration-700 ease-out"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  src={afterSrc}
                  onError={() => {
                    if (afterIndex < afterCandidates.length - 1) {
                      setAfterIndex(afterIndex + 1);
                      return;
                    }
                    setAfterError(true);
                  }}
                  onLoad={() => setAfterError(false)}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-transparent mix-blend-overlay" />
              </div>

              <div
                className="absolute inset-0 z-10"
                style={{ clipPath: `inset(0 ${clipRightPercent}% 0 0)` }}
              >
                <Image
                  alt="Before image"
                  className="object-cover object-center"
                  fill
                  priority
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  src={beforeSrc}
                  onError={() => {
                    if (beforeIndex < beforeCandidates.length - 1) {
                      setBeforeIndex(beforeIndex + 1);
                      return;
                    }
                    setBeforeError(true);
                  }}
                  onLoad={() => setBeforeError(false)}
                />
                <div className="absolute inset-0 bg-black/20 mix-blend-multiply" />
              </div>

              <div className="pointer-events-none absolute left-0 top-0 z-30 flex w-full items-start justify-between px-6 pt-6">
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-[#0f172a]/60 border border-white/10 backdrop-blur-md shadow-lg">
                  <span className="text-slate-300 text-xs font-bold tracking-widest uppercase">
                    Before
                  </span>
                </span>
                <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-blue-600/20 border border-blue-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                  <span className="size-2 rounded-full bg-blue-400 mr-2 animate-pulse" />
                  <span className="text-blue-100 text-xs font-bold tracking-widest uppercase">
                    After
                  </span>
                </span>
              </div>

              <div
                className="absolute inset-y-0 w-10 cursor-ew-resize flex items-center justify-center z-30 group/slider -translate-x-1/2"
                style={{ left: `${percent}%` }}
              >
                <div className="absolute inset-y-0 w-[6px] -translate-x-1/2 bg-[#0f172a] shadow-[10px_0_40px_rgba(0,0,0,0.8)]" />
                <div className="absolute top-0 bottom-0 w-[2px] bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] group-hover/slider:shadow-[0_0_30px_rgba(59,130,246,1)] transition-all" />
                <div className="relative size-12 rounded-full bg-[#0f172a] border-[3px] border-blue-500 shadow-[0_0_25px_rgba(59,130,246,0.6)] flex items-center justify-center transform group-hover/slider:scale-110 transition-transform duration-200">
                  <span className="material-symbols-outlined rotate-90 text-blue-100 text-[20px] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    code
                  </span>
                </div>
              </div>

              <div className="pointer-events-none absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#0f172a]/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-300 backdrop-blur">
                Drag or swipe to compare
              </div>
            </div>

            <div className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0b1120] border-t border-blue-900/30">
              <div className="flex flex-col gap-2 items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <span className="material-symbols-outlined text-blue-400 text-[24px]">
                      auto_fix_high
                    </span>
                  </div>
                  <div>
                    <h3 className="text-white text-lg font-bold leading-tight tracking-tight">
                      AI Background Removal
                    </h3>
                    <p className="text-blue-300/60 text-sm font-medium mt-0.5">
                      Drag slider to compare output quality
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Link
                  className="group flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-primary hover:bg-blue-500 transition-all shadow-[0_0_25px_rgba(59,130,246,0.4)] hover:shadow-[0_0_35px_rgba(59,130,246,0.6)] active:scale-95 text-white text-sm font-bold tracking-wide"
                  href="/register"
                >
                  <span>Process Image</span>
                  <span className="material-symbols-outlined text-[18px] group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </Link>
              </div>
            </div>

            <div className="h-1 w-full bg-[#0f172a]">
              <div className="h-full w-full bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-30" />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
