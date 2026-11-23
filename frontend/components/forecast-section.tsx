"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { useData } from "@/components/data-provider";
import { LazyInView } from "@/components/lazy-in-view";
import { Reveal } from "@/components/reveal";
import { Section } from "@/components/section";
import { SectionSkeleton } from "@/components/states";
import type { ForecastPoint } from "@/components/forecast-lines";
import { Skeleton } from "@/components/ui/skeleton";
import { SelectField } from "@/components/select-field";
import { bandCoverage, testWeeks } from "@/lib/stats";
import { pct } from "@/lib/format";
import type { ShopData } from "@/lib/types";

type ForecastData = Pick<ShopData, "outlets" | "products" | "forecast_vs_actual">;

const ForecastLines = dynamic(() => import("@/components/forecast-lines").then((m) => m.ForecastLines), {
  ssr: false,
  loading: () => <Skeleton aria-hidden="true" className="h-full w-full" />,
});

function KeyItem({ sample, label }: { sample: React.ReactNode; label: string }) {
  return (
    <li className="flex items-center gap-2">
      {sample}
      {label}
    </li>
  );
}

/** Forecast chart with product (and optionally shop) pickers. Pass `fixedOutlet` to show a single shop. */
export function ForecastExplorer({ data, fixedOutlet }: { data: ForecastData; fixedOutlet?: string }) {
  const [pickedOutlet, setOutlet] = useState(data.outlets[0]);
  const outlet = fixedOutlet ?? pickedOutlet;
  const [product, setProduct] = useState(data.products[0]);

  const points: ForecastPoint[] = useMemo(
    () =>
      data.forecast_vs_actual
        .filter((r) => r.outlet === outlet && r.product === product)
        .map((r) => ({
          date: r.date,
          forecast: r.forecast,
          actual: r.actual,
          low: r.forecast_low,
          band: r.forecast_high - r.forecast_low,
          high: r.forecast_high,
        })),
    [data, outlet, product],
  );
  const coverage = useMemo(
    () => bandCoverage(data.forecast_vs_actual.filter((r) => !fixedOutlet || r.outlet === fixedOutlet)),
    [data, fixedOutlet],
  );
  const summary = `Daily forecast and actual units for ${product} at ${outlet}, ${points.length} days. The chart is drawn from the same data as the table in the next section.`;

  return (
    <div className="rounded-2xl border border-border bg-card shadow-card p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        {!fixedOutlet && (
          <SelectField id="forecast-outlet" label="Outlet" value={outlet} options={data.outlets} onChange={setOutlet} />
        )}
        <SelectField
          id="forecast-product"
          label="Product"
          value={product}
          options={data.products}
          onChange={setProduct}
        />
      </div>
      <p className="sr-only" id="forecast-summary">
        {summary}
      </p>
      <div className="mt-5" aria-describedby="forecast-summary">
        <LazyInView height={300}>
          <ForecastLines data={points} />
        </LazyInView>
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted-foreground" aria-label="Chart key">
        <KeyItem
          label="Forecast"
          sample={
            <svg aria-hidden="true" width="22" height="6">
              <line x1="0" y1="3" x2="22" y2="3" stroke="var(--orange)" strokeWidth="2" strokeDasharray="6 4" />
            </svg>
          }
        />
        <KeyItem
          label="Actual"
          sample={
            <svg aria-hidden="true" width="22" height="6">
              <line x1="0" y1="3" x2="22" y2="3" stroke="var(--foreground)" strokeWidth="2" />
            </svg>
          }
        />
        <KeyItem
          label="Likely range"
          sample={<span aria-hidden="true" className="h-2.5 w-5 rounded-sm bg-brand/25" />}
        />
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        The shaded band is the range the model expected for each day.{" "}
        {fixedOutlet ? `Across all products at ${fixedOutlet}` : "Across all outlets and products"}, actual sales fell
        inside it on <span className="tabular-nums text-foreground">{pct(coverage)}</span> of days.
      </p>
    </div>
  );
}

export function ForecastSection() {
  const data = useData();
  const period = data ? `the last ${testWeeks(data.forecast_vs_actual)} weeks` : "the test period";
  return (
    <Section
      id="forecast"
      eyebrow="Accuracy"
      title="Forecast vs actual"
      intro={`Daily units over ${period}: what the model forecast, and what sold.`}
    >
      <Reveal>
        {data ? <ForecastExplorer data={data} /> : <SectionSkeleton className="h-[34rem] w-full rounded-2xl" />}
      </Reveal>
    </Section>
  );
}
