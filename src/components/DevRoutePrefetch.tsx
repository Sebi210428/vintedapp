"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

type Props = {
  hrefs: string[];
  enabled?: boolean;
};

function runIdle(callback: () => void) {
  const runtime = globalThis as unknown as {
    requestIdleCallback?: (cb: () => void) => number;
    setTimeout: typeof setTimeout;
  };

  if (runtime.requestIdleCallback) {
    runtime.requestIdleCallback(callback);
    return;
  }

  runtime.setTimeout(callback, 250);
}

export default function DevRoutePrefetch({ hrefs, enabled = true }: Props) {
  const router = useRouter();
  const key = hrefs.join("|");

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    runIdle(() => {
      if (cancelled) return;
      for (const href of hrefs) {
        router.prefetch(href);
      }
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, key, enabled]);

  return null;
}
