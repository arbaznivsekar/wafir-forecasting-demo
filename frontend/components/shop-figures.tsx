import type { ReactNode } from "react";
import { int, kwd, pct } from "@/lib/format";
import { historyWeeks, shopTotals } from "@/lib/shop";
import type { ShopData } from "@/lib/types";

type FigureProps = { label: string; value: ReactNode; notes: string[] };

function Figure({ label, value, notes }: FigureProps) {
  return (
    <div className="flex flex-col rounded-[1.25rem] border border-border bg-card p-4 shadow-card sm:p-5">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-2 tabular-nums">
        <span className="block text-3xl font-semibold tracking-tight">{value}</span>
        {notes.map((note) => (
          <span key={note} className="mt-1 block text-sm text-muted-foreground">
            {note}
          </span>
        ))}
      </dd>
    </div>
  );
}

/** The four numbers that tell the story of one shop. */
export function ShopFigures({ data, outlet }: { data: ShopData; outlet: string }) {
  const totals = shopTotals(data, outlet);
  const weeks = historyWeeks(data).length;
  return (
    <dl className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Figure label="Delivered" value={int(totals.delivered)} notes={[`units, last ${weeks} weeks`]} />
      <Figure
        label="Wasted"
        value={int(totals.wasted)}
        notes={[`${pct(totals.wastePct)} of units`, `${kwd(totals.wasteCostKwd)} lost`]}
      />
      <Figure label="Ran out of stock" value={pct(totals.stockoutPct)} notes={["of product-days"]} />
      <Figure label="Suggested next week" value={int(totals.nextWeekUnits)} notes={["units to send"]} />
    </dl>
  );
}
