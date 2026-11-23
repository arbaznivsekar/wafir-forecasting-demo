"use client";

import { useReducedMotion } from "motion/react";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis, Tooltip } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { longDate, num, shortDate } from "@/lib/format";

export type ForecastPoint = { date: string; forecast: number; actual: number; low: number; band: number; high: number };

const config = {
  forecast: { label: "Forecast", color: "var(--orange)" },
  actual: { label: "Actual", color: "var(--foreground)" },
  band: { label: "Likely range", color: "var(--brand)" },
} satisfies ChartConfig;

function isPoint(value: unknown): value is ForecastPoint {
  return typeof value === "object" && value !== null && "date" in value && "forecast" in value && "high" in value;
}

function PointTooltip({ active, payload }: { active?: boolean; payload?: ReadonlyArray<{ payload?: unknown }> }) {
  const point = payload?.[0]?.payload;
  if (!active || !isPoint(point)) return null;
  return (
    <div className="rounded-lg border border-border bg-popover px-3 py-2 text-xs shadow-xl tabular-nums">
      <p className="font-medium">{longDate(point.date)}</p>
      <p className="mt-1 text-brand-ink">Forecast {num(point.forecast)}</p>
      <p>Actual {num(point.actual)}</p>
      <p className="text-muted-foreground">
        Likely range {num(point.low)} to {num(point.high)}
      </p>
    </div>
  );
}

/** Forecast and actual lines with the low-to-high band behind them. */
export function ForecastLines({ data }: { data: ForecastPoint[] }) {
  const reduced = useReducedMotion();
  const animate = !reduced;

  return (
    <ChartContainer config={config} className="aspect-auto h-full w-full">
      <ComposedChart accessibilityLayer data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="date" tickFormatter={shortDate} interval={6} tickLine={false} axisLine={false} tickMargin={8} />
        <YAxis width={32} tickLine={false} axisLine={false} />
        <Tooltip content={<PointTooltip />} cursor={{ stroke: "var(--border)" }} />
        {/* The band is drawn as a transparent base (low) plus a visible slice (high - low). */}
        <Area
          dataKey="low"
          stackId="band"
          stroke="none"
          fill="transparent"
          isAnimationActive={false}
          activeDot={false}
        />
        <Area
          dataKey="band"
          stackId="band"
          stroke="none"
          fill="var(--color-band)"
          fillOpacity={0.18}
          isAnimationActive={animate}
          activeDot={false}
        />
        <Line
          dataKey="forecast"
          stroke="var(--color-forecast)"
          strokeWidth={2}
          strokeDasharray="6 4"
          dot={false}
          isAnimationActive={animate}
        />
        <Line
          dataKey="actual"
          stroke="var(--color-actual)"
          strokeWidth={1.75}
          dot={false}
          isAnimationActive={animate}
        />
      </ComposedChart>
    </ChartContainer>
  );
}
