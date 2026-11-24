import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = { label: string; children: ReactNode; className?: string };

/**
 * A table that scrolls inside its own box, so the page never scrolls sideways.
 * The box can be focused, so keyboard users can scroll it too.
 */
export function ScrollTable({ label, children, className }: Props) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cn(
        "overflow-auto rounded-lg border border-border focus-visible:outline-2 focus-visible:outline-ring",
        className,
      )}
    >
      <table className="w-full border-separate border-spacing-0 text-[13px] tabular-nums sm:text-sm">
        <caption className="sr-only">{label}</caption>
        {children}
      </table>
    </div>
  );
}
