"use client";

import { useReducedMotion } from "motion/react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { num } from "@/lib/format";

export type BarDatum = { label: string; before: number; after: number };

type Props = {
  data: BarDatum[];
  /** Formats the value printed at the end of each bar. */
  format: (n: number) => string;
  labelWidth?: number;
  /** Room on the right for the longest value label. */
  rightMargin?: number;
};

const config = {
  before: { label: "Before", color: "var(--bar-before)" },
  after: { label: "After", color: "var(--brand)" },
} satisfies ChartConfig;

/** Horizontal before/after bars with the value printed on each bar (no hover needed on phones). */
export function BeforeAfterBars({ data, format, labelWidth = 112, rightMargin = 52 }: Props) {
  const reduced = useReducedMotion();
  const animate = !reduced;

  // Mounted by <LazyInView> when it scrolls into view, so the bars grow in at that moment.
  return (
    <ChartContainer config={config} className="aspect-auto h-full w-full">
      <BarChart
        accessibilityLayer
        data={data}
        layout="vertical"
        margin={{ top: 4, right: rightMargin, bottom: 4, left: 0 }}
        barCategoryGap="22%"
        barGap={3}
      >
        <CartesianGrid horizontal={false} />
        <XAxis type="number" hide />
        <YAxis
          dataKey="label"
          type="category"
          width={labelWidth}
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 12 }}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              formatter={(value, name) => `${config[name as keyof typeof config].label}: ${num(Number(value))}`}
            />
          }
        />
        {(["before", "after"] as const).map((key) => (
          <Bar
            key={key}
            dataKey={key}
            fill={`var(--color-${key})`}
            radius={4}
            isAnimationActive={animate}
            animationDuration={700}
          >
            <LabelList
              dataKey={key}
              position="right"
              fontSize={11}
              className="fill-muted-foreground tabular-nums"
              formatter={(value: unknown) => format(Number(value))}
            />
          </Bar>
        ))}
      </BarChart>
    </ChartContainer>
  );
}
