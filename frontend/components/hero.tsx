import Link from "next/link";
import { DummyNote } from "@/components/dummy-note";
import { HeroBackground } from "@/components/hero-background";
import { ProductStrip } from "@/components/product-strip";

const ring = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";

export function Hero() {
  return (
    <header className="relative isolate overflow-hidden">
      <HeroBackground />
      <div className="mx-auto grid max-w-5xl gap-12 px-5 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:gap-16 lg:pb-28 lg:pt-24">
        <div>
          <DummyNote />
          <h1 className="mt-7 text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.035em] sm:text-6xl lg:text-7xl">
            Demand Forecasting Demo
          </h1>
          <p className="mt-5 text-xl font-medium text-foreground/80 sm:text-2xl">
            A sample built for Wafir, on dummy data.
          </p>
          <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
            Cakes and pastries keep for only a few days. When the wrong stock goes to an outlet, it turns into returns
            and waste.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-3">
            <a
              href="#results"
              className={`inline-flex h-12 items-center rounded-full bg-foreground px-6 text-sm font-medium text-background transition-opacity hover:opacity-90 ${ring}`}
            >
              See the results
            </a>
            <Link
              href="/"
              className={`inline-flex h-12 items-center rounded-full px-5 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground ${ring}`}
            >
              Open the shops <span aria-hidden="true">&nbsp;&rarr;</span>
            </Link>
          </div>
        </div>
        <ProductStrip />
      </div>
    </header>
  );
}
