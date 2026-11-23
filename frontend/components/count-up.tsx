"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

type Props = { value: number; format: (n: number) => string };

/**
 * Counts from 0 to `value` when scrolled into view. The final value is always in the
 * accessibility tree, and with reduced motion it is shown immediately.
 */
export function CountUp({ value, format }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduced = useReducedMotion();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, { duration: 1.1, ease: "easeOut", onUpdate: setCurrent });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <span ref={ref}>
      <span className="sr-only">{format(value)}</span>
      <span aria-hidden="true">{format(reduced ? value : current)}</span>
    </span>
  );
}
