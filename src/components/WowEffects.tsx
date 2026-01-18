"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

function easeOutCubic(progress: number) {
  return 1 - Math.pow(1 - progress, 3);
}

function animateNumber(el: HTMLElement, to: number, durationMs: number) {
  const prefersReducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    el.textContent = String(to);
    return;
  }

  const from = 0;
  const start = performance.now();

  const tick = (now: number) => {
    const t = Math.min(1, (now - start) / durationMs);
    const eased = easeOutCubic(t);
    const current = Math.round(from + (to - from) * eased);
    el.textContent = String(current);
    if (t < 1) requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

export default function WowEffects({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let cleanup: (() => void) | null = null;

    const runtime = globalThis as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout?: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
      setTimeout: typeof setTimeout;
      clearTimeout: typeof clearTimeout;
    };

    const init = () => {
      const prefersReducedMotion =
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
      const canTilt =
        window.matchMedia?.("(pointer: fine)").matches ?? false;

      const countEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-wow-count]"),
      );
      const navEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-wow-nav]"),
      );
      const tiltEls = Array.from(
        document.querySelectorAll<HTMLElement>("[data-wow-tilt]"),
      );

      let raf = 0;
      let onScroll: ((event: Event) => void) | null = null;

      let countObserver: IntersectionObserver | null = null;
      if (countEls.length) {
        const counted = new WeakSet<HTMLElement>();
        countObserver = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const el = entry.target as HTMLElement;
              if (counted.has(el)) continue;
              counted.add(el);

              const raw = el.getAttribute("data-wow-count") ?? "";
              const to = Number(raw);
              if (Number.isFinite(to)) {
                const durationMs = Number(el.getAttribute("data-wow-duration")) || 900;
                animateNumber(el, to, durationMs);
              }
              countObserver?.unobserve(el);
            }
          },
          { threshold: 0.35 },
        );

        for (const el of countEls) countObserver.observe(el);
      }

      if (navEls.length) {
        const setNavState = () => {
          const isScrolled = window.scrollY > 10;
          for (const nav of navEls) {
            nav.classList.toggle("is-scrolled", isScrolled);
          }
        };

        onScroll = () => {
          cancelAnimationFrame(raf);
          raf = requestAnimationFrame(setNavState);
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        setNavState();
      }

      const tiltCleanups: Array<() => void> = [];
      if (canTilt && !prefersReducedMotion) {
        for (const el of tiltEls) {
          const max = Number(el.getAttribute("data-wow-tilt-max")) || 10;
          const baseRx = Number(el.getAttribute("data-wow-tilt-rx")) || 4;
          const baseRy = Number(el.getAttribute("data-wow-tilt-ry")) || -10;
          const scope = el.closest<HTMLElement>("[data-wow-tilt-scope]") ?? el;

        const setBase = () => {
          el.style.setProperty("--wow-rx", `${baseRx}deg`);
          el.style.setProperty("--wow-ry", `${baseRy}deg`);
        };
        setBase();

        let pendingRaf = 0;
        let pendingRx = baseRx;
        let pendingRy = baseRy;

        const commit = () => {
          pendingRaf = 0;
          el.style.setProperty("--wow-rx", `${pendingRx.toFixed(2)}deg`);
          el.style.setProperty("--wow-ry", `${pendingRy.toFixed(2)}deg`);
        };

        const requestCommit = () => {
          if (pendingRaf) return;
          pendingRaf = requestAnimationFrame(commit);
        };

        const clamp = (value: number, min: number, maxVal: number) =>
          Math.max(min, Math.min(maxVal, value));

        const onMove = (event: PointerEvent) => {
          const elRect = el.getBoundingClientRect();
          const xRaw = (event.clientX - elRect.left) / elRect.width;
          const yRaw = (event.clientY - elRect.top) / elRect.height;
          const x = clamp(xRaw, 0, 1);
          const y = clamp(yRaw, 0, 1);

          pendingRy = (x - 0.5) * max * 2;
          pendingRx = (0.5 - y) * max * 2;
          requestCommit();
        };
        const onLeave = () => setBase();

        scope.addEventListener("pointermove", onMove);
        scope.addEventListener("pointerleave", onLeave);
        tiltCleanups.push(() => {
          scope.removeEventListener("pointermove", onMove);
          scope.removeEventListener("pointerleave", onLeave);
          if (pendingRaf) cancelAnimationFrame(pendingRaf);
        });
        }
      }

      return () => {
        countObserver?.disconnect();
        if (onScroll) window.removeEventListener("scroll", onScroll);
        cancelAnimationFrame(raf);
        for (const cleanup of tiltCleanups) cleanup();
      };
    };

    const run = () => {
      if (cancelled) return;
      cleanup = init();
    };

    const handle =
      runtime.requestIdleCallback?.(run, { timeout: 800 }) ??
      runtime.setTimeout(run, 250);

    return () => {
      cancelled = true;
      if (runtime.cancelIdleCallback && typeof handle === "number") {
        runtime.cancelIdleCallback(handle);
      } else {
        runtime.clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
      }
      cleanup?.();
    };
  }, [enabled, pathname]);

  return null;
}
