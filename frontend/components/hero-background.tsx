"use client";

import { useReducedMotion } from "motion/react";
import { Spotlight } from "@/components/ui/spotlight-new";

// Saffron version of the Aceternity "Spotlight New" defaults (they ship blue), kept faint on purpose.
const saffron = (alpha: number, light: number) => `hsla(40, 100%, ${light}%, ${alpha})`;

/** Hero light: a slow warm beam, or a still glow when the visitor prefers reduced motion. */
export function HeroBackground() {
  const reduced = useReducedMotion();
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0.99_0.02_88),transparent_75%)]" />
      {reduced ? (
        <div className="absolute inset-0 bg-[radial-gradient(55%_55%_at_80%_0%,oklch(0.93_0.09_85/0.45),transparent_70%)]" />
      ) : (
        <Spotlight
          gradientFirst={`radial-gradient(68.54% 68.72% at 55.02% 31.46%, ${saffron(0.2, 62)} 0, ${saffron(0.06, 55)} 50%, ${saffron(0, 45)} 80%)`}
          gradientSecond={`radial-gradient(50% 50% at 50% 50%, ${saffron(0.13, 62)} 0, ${saffron(0.04, 55)} 80%, transparent 100%)`}
          gradientThird={`radial-gradient(50% 50% at 50% 50%, ${saffron(0.1, 62)} 0, ${saffron(0.03, 45)} 80%, transparent 100%)`}
        />
      )}
    </div>
  );
}
