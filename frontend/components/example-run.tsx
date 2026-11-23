"use client";

import type { ReactNode } from "react";
import dynamic from "next/dynamic";
import { CountUp } from "@/components/count-up";
import { useData } from "@/components/data-provider";
import { LazyInView } from "@/components/lazy-in-view";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { SectionSkeleton } from "@/components/states";
import { Skeleton } from "@/components/ui/skeleton";
import { num, pct } from "@/lib/format";
import type { DashboardData } from "@/lib/types";
import type { BarDatum } from "@/components/before-after-bars";

// Recharts is loaded after first paint so it does not slow the hero.
const BeforeAfterBars = dynamic(() => import("@/components/before-after-bars").then((m) => m.BeforeAfterBars), {
  ssr: false,
  loading: () => <Skeleton aria-hidden="true" className="h-full w-full" />,
});

type BarsProps = {
  data: BarDatum[];
  format: (n: number) => string;
  height: number;
  labelWidth: number;
  rightMargin?: number;
};

function Bars({ height, ...props }: BarsProps) {
  return (
    <LazyInView height={height}>
      <BeforeAfterBars {...props} />
    </LazyInView>
  );
}

function Legend() {
  return (
    <ul className="flex gap-4 text-xs text-muted-foreground" aria-label="Chart key">
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-sm bg-bar-before" />
        Before
      </li>
      <li className="flex items-center gap-1.5">
        <span aria-hidden="true" className="size-2.5 rounded-sm bg-brand" />
        After
      </li>
    </ul>
  );
}

/** Amount in KWD with a small unit label, so long figures never wrap onto two lines. */
function Kwd({ value }: { value: number }) {
  return (
    <>
      <span className="mr-1.5 text-sm font-normal text-muted-foreground">KWD</span>
      <CountUp value={value} format={num} />
    </>
  );
}

type ChartCardProps = { id: string; title: string; summary: string; caption?: string; children: ReactNode };

function ChartCard({ id, title, summary, caption, children }: ChartCardProps) {
  return (
    <figure
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-summary`}
      className="h-full rounded-2xl border border-border bg-card shadow-card p-4 sm:p-5"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 id={`${id}-title`} className="text-base font-medium">
          {title}
        </h3>
        <Legend />
      </div>
      <p id={`${id}-summary`} className="sr-only">
        {summary}
      </p>
      <div className="mt-4">{children}</div>
      {caption && <figcaption className="mt-3 text-sm leading-relaxed text-muted-foreground">{caption}</figcaption>}
    </figure>
  );
}

const describe = (rows: BarDatum[], fmt: (n: number) => string) =>
  rows.map((r) => `${r.label}: ${fmt(r.before)} before, ${fmt(r.after)} after.`).join(" ");

function Run({ data }: { data: DashboardData }) {
  const { summary, robustness, by_outlet, by_product } = data;
  const outlets: BarDatum[] = by_outlet.map((r) => ({
    label: r.outlet,
    before: r.waste_pct_before,
    after: r.waste_pct_after,
  }));
  const products: BarDatum[] = by_product.map((r) => ({
    label: r.product,
    before: r.waste_pct_before,
    after: r.waste_pct_after,
  }));
  const money: BarDatum[] = [
    { label: "Waste cost", ...summary.waste_cost_kwd },
    { label: "Lost margin (stockouts)", ...summary.lost_margin_kwd },
  ];
  const aboveAverage = summary.kwd_saved > robustness.kwd_saved.mean;
  const tradeOff =
    summary.waste_cost_kwd.after < summary.waste_cost_kwd.before &&
    summary.lost_margin_kwd.after > summary.lost_margin_kwd.before;

  return (
    <div className="space-y-4">
      <p className="rounded-xl border border-brand/30 bg-brand/10 px-4 py-3 text-sm leading-relaxed">
        <strong className="font-semibold text-brand-ink">Example run.</strong>{" "}
        {aboveAverage
          ? `Its KWD saved is above the ${robustness.runs}-run average, so it is a better-than-typical case.`
          : `Its KWD saved is at or below the ${robustness.runs}-run average.`}
      </p>

      <Reveal>
        <section
          aria-labelledby="margin-title"
          className="card-glow rounded-2xl border border-border bg-card shadow-card p-5 sm:p-6"
        >
          <h3 id="margin-title" className="text-base font-medium">
            Gross margin
          </h3>
          <dl className="mt-4 grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-sm text-muted-foreground">Before</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">
                <Kwd value={summary.margin_kwd.before} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">After</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums text-brand-ink sm:text-3xl">
                <Kwd value={summary.margin_kwd.after} />
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">KWD saved in this run</dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">
                <Kwd value={summary.kwd_saved} />
              </dd>
            </div>
          </dl>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Margin on units sold, minus the cost of units thrown away.
          </p>
        </section>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-2">
        <Reveal>
          <ChartCard id="waste-outlet" title="Waste % by outlet" summary={describe(outlets, pct)}>
            <Bars data={outlets} format={pct} height={360} labelWidth={116} />
          </ChartCard>
        </Reveal>
        <Reveal>
          <ChartCard
            id="money-lost"
            title="Money lost, in KWD"
            summary={describe(money, (n) => `${num(n)} KWD`)}
            caption={
              tradeOff
                ? "Waste cost went down and lost margin went up a little. That is the trade-off: fewer thrown-away items, a few more missed sales."
                : "Waste cost is money spent on items thrown away. Lost margin is profit missed when stock ran out."
            }
          >
            <Bars data={money} format={num} height={190} labelWidth={116} rightMargin={64} />
          </ChartCard>
        </Reveal>
      </div>

      <Reveal>
        <ChartCard id="waste-product" title="Waste % by product" summary={describe(products, pct)}>
          <Bars data={products} format={pct} height={420} labelWidth={116} />
        </ChartCard>
      </Reveal>
    </div>
  );
}

export function ExampleRunSection() {
  const data = useData();
  return (
    <Section
      id="example"
      eyebrow="One run, up close"
      title="Example run"
      intro="These charts show one run of the simulation. They are not averages."
    >
      {data ? <Run data={data} /> : <SectionSkeleton className="h-[70rem] w-full rounded-2xl" />}
    </Section>
  );
}
