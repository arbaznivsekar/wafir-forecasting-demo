import type { ForecastRow, Spread } from "@/lib/types";

/** Number of whole weeks covered by the forecast test period (distinct days / 7). */
export function testWeeks(rows: ForecastRow[]): number {
  return Math.round(new Set(rows.map((r) => r.date)).size / 7);
}

/** The larger absolute end of a range, rounded to whole points: "about N points". */
export function aboutPoints(s: Spread): number {
  return Math.round(Math.max(Math.abs(s.min), Math.abs(s.max)));
}

/** Share of delivered units that were thrown away, in percent. */
export function wastePct(delivered: number, wasted: number): number {
  return delivered === 0 ? 0 : (100 * wasted) / delivered;
}

/** Share of test days where the actual sales fell inside the forecast band, in percent. */
export function bandCoverage(rows: ForecastRow[]): number {
  const inside = rows.filter((r) => r.actual >= r.forecast_low && r.actual <= r.forecast_high).length;
  return (100 * inside) / rows.length;
}

/** Smallest average change, in points, that we call a real move rather than noise. */
const NOTICEABLE_POINTS = 0.5;

/** One honest sentence about how stockouts changed across the simulated runs. */
export function stockoutLead(s: Spread): string {
  const mixed = s.min < 0 && s.max > 0;
  const swing = `It can go either way by about ${aboutPoints(s)} points.`;
  if (!mixed) return s.mean < 0 ? "Fewer stockouts in every run." : "More stockouts in every run.";
  if (Math.abs(s.mean) < NOTICEABLE_POINTS) return `No clear change on average. ${swing}`;
  return `${s.mean < 0 ? "Slightly fewer" : "Slightly more"} stockouts on average, but not in every run. ${swing}`;
}
