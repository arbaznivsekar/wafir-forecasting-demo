"use client";

import { useRef, type ReactNode } from "react";
import { useInView } from "motion/react";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Reserves a fixed-height box and renders `children` only once it is about to scroll into view.
 * Charts sit inside it, so the charting code is not loaded or run until someone gets near them,
 * and the bars and lines grow in at the moment they appear.
 */
export function LazyInView({ height, children }: { height: number; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "100px" });
  return (
    <div ref={ref} style={{ height }} className="w-full">
      {inView ? children : <Skeleton aria-hidden="true" className="h-full w-full" />}
    </div>
  );
}
