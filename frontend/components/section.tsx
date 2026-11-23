import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  id: string;
  eyebrow?: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Shared page section: small eyebrow, one h2, optional intro. Labelled for assistive tech. */
export function Section({ id, eyebrow, title, intro, children, className }: Props) {
  return (
    <section aria-labelledby={`${id}-title`} className={cn("py-14 sm:py-20", className)}>
      {eyebrow && (
        <p className="mb-3 flex items-center gap-2.5 text-xs font-medium uppercase tracking-[0.14em] text-brand-ink">
          <span aria-hidden="true" className="h-px w-6 bg-brand" />
          {eyebrow}
        </p>
      )}
      <h2 id={`${id}-title`} className="text-3xl font-semibold sm:text-4xl">
        {title}
      </h2>
      {intro && (
        <div className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">{intro}</div>
      )}
      <div className="mt-8 sm:mt-10">{children}</div>
    </section>
  );
}
