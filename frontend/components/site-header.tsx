"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

// Shops come first; every shop page also counts as "Shops".
const links = [
  { href: "/", label: "Shops", isCurrent: (path: string) => path === "/" || path.startsWith("/shops") },
  { href: "/overview", label: "Overview", isCurrent: (path: string) => path.startsWith("/overview") },
];

/** Slim top bar with pill links; the current section is the dark pill. */
export function SiteHeader() {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="border-b border-border/70 bg-card/80 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-2">
        <Link
          href="/"
          aria-label="Demand Forecasting Demo, shops"
          className="inline-flex min-h-11 items-center gap-2 rounded-lg font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <span
            aria-hidden="true"
            className="grid size-7 place-items-center rounded-lg bg-foreground text-xs font-bold text-brand"
          >
            W
          </span>
          <span className="hidden text-sm sm:inline">Demand Forecasting Demo</span>
        </Link>
        <ul className="flex items-center gap-1">
          {links.map(({ href, label, isCurrent }) => {
            const current = isCurrent(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center rounded-full px-4 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    current
                      ? "bg-foreground font-medium text-background"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
