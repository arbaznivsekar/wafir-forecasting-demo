"use client";

import type { ReactNode } from "react";
import { CountUp } from "@/components/count-up";
import { useData } from "@/components/data-provider";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { SectionSkeleton } from "@/components/states";
import { stockoutLead, testWeeks } from "@/lib/stats";
import { kwd, num, pct, pts, range } from "@/lib/format";
import type { DashboardData } from "@/lib/types";

type CardProps = {
  title: string;
  lead?: string;
  figure: ReactNode;
  range: string;
  caption: string;
};

function StatCard({ title, lead, figure, range, caption }: CardProps) {
  return (
    <article className="card-glow flex h-full flex-col rounded-2xl border border-border bg-card shadow-card p-5 sm:p-6">
      <h3 className="text-sm font-medium tracking-normal text-muted-foreground">{title}</h3>
      {lead && <p className="mt-2 text-sm leading-relaxed text-foreground">{lead}</p>}
      <p className="mt-4 text-5xl font-semibold tracking-[-0.035em] tabular-nums">{figure}</p>
      <p className="mt-3 text-sm tabular-nums text-muted-foreground">{range}</p>
      <p className="mt-auto pt-4 text-sm leading-relaxed text-muted-foreground">{caption}</p>
    </article>
  );
}

function Cards({ data }: { data: DashboardData }) {
  const { runs, waste_cut_pct: waste, stockout_change_pts: stockouts, kwd_saved: saved } = data.robustness;
  const weeks = testWeeks(data.forecast_vs_actual);
  const acrossRuns = `across ${runs} simulated runs`;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Reveal>
        <StatCard
          title="Waste cut"
          figure={<CountUp value={waste.mean} format={pct} />}
          range={`Average. Range ${range(waste.min, waste.max, pct)} ${acrossRuns}.`}
          caption={`${waste.min > 0 ? "Above zero in every run. " : ""}Less food thrown away than with the current ordering rule.`}
        />
      </Reveal>
      <Reveal>
        <StatCard
          title="Stockout change"
          lead={stockoutLead(stockouts)}
          figure={<CountUp value={stockouts.mean} format={pts} />}
          range={`Average. Range ${range(stockouts.min, stockouts.max, pts)} ${acrossRuns}.`}
          caption="Below zero means fewer stockouts. Above zero means more."
        />
      </Reveal>
      <Reveal>
        <StatCard
          title={`KWD saved over the ${weeks}-week test`}
          figure={
            <>
              <span className="mr-2 text-xl font-normal text-muted-foreground sm:text-2xl">KWD</span>
              <CountUp value={saved.mean} format={num} />
            </>
          }
          range={`Average. Range ${range(saved.min, saved.max, kwd)} ${acrossRuns}.`}
          caption={`${saved.min > 0 ? "Above zero in every run. " : ""}Dummy-scale amounts. Read the direction, not the size. Not a promise of savings.`}
        />
      </Reveal>
    </div>
  );
}

export function HeadlineSection() {
  const data = useData();
  return (
    <Section
      id="headline"
      eyebrow="The results"
      title="What the simulation shows"
      intro="Averages across many simulated runs, with the lowest and highest result for each."
    >
      {data ? <Cards data={data} /> : <SectionSkeleton className="h-[34rem] w-full rounded-2xl md:h-72" />}
    </Section>
  );
}
