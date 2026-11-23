import type { ShopData } from "@/lib/types";

const sum = (values: number[]): number => values.reduce((a, b) => a + b, 0);

/** "Petrol Station Shop" -> "petrol-station-shop" (used in page addresses). */
export const slugify = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Distinct week start dates in the shop history, oldest first. */
export const historyWeeks = (data: ShopData): string[] =>
  [...new Set(data.shop_history.map((r) => r.week_start))].sort();

export type ShopTotals = {
  delivered: number;
  wasted: number;
  wasteCostKwd: number;
  wastePct: number;
  /** Share of product-days on which the shop ran out of stock, in percent. */
  stockoutPct: number;
  nextWeekUnits: number;
};

/** Totals for one shop over the whole history period, plus next week's suggested units. */
export function shopTotals(data: ShopData, outlet: string): ShopTotals {
  const history = data.shop_history.filter((r) => r.outlet === outlet);
  const delivered = sum(history.map((r) => r.units_delivered));
  const wasted = sum(history.map((r) => r.units_wasted));
  const productDays = sum(history.map((r) => r.days_recorded));
  return {
    delivered,
    wasted,
    wasteCostKwd: sum(history.map((r) => r.waste_cost_kwd)),
    wastePct: delivered === 0 ? 0 : (100 * wasted) / delivered,
    stockoutPct: productDays === 0 ? 0 : (100 * sum(history.map((r) => r.stockout_days))) / productDays,
    nextWeekUnits: sum(data.send_plan.filter((r) => r.outlet === outlet).map((r) => r.units)),
  };
}

/** The shop with the largest share of delivered units wasted. */
export function highestWasteShop(data: ShopData): string {
  return data.outlets.reduce((worst, outlet) =>
    shopTotals(data, outlet).wastePct > shopTotals(data, worst).wastePct ? outlet : worst,
  );
}

export type NeedRow = {
  product: string;
  /** Expected sales over the whole next week. */
  weekSales: number;
  /** Expected sales on an average day. */
  perDay: number;
  /** Suggested units to send over the week. */
  units: number;
  boxSize: number;
  boxes: number;
};

/** What one shop is expected to sell next week and how much to send, per product. */
export function nextWeekNeeds(data: ShopData, outlet: string): { dates: string[]; rows: NeedRow[] } {
  const plan = data.send_plan.filter((r) => r.outlet === outlet);
  const dates = [...new Set(plan.map((r) => r.date))].sort();
  const rows = data.products.map((product) => {
    const mine = plan.filter((r) => r.product === product);
    const weekSales = sum(mine.map((r) => r.forecast));
    const units = sum(mine.map((r) => r.units));
    const boxSize = data.case_sizes[product];
    return { product, weekSales, perDay: weekSales / dates.length, units, boxSize, boxes: units / boxSize };
  });
  return { dates, rows };
}

/** The product at a shop with the largest share of its deliveries wasted. */
export function mostWastedProduct(data: ShopData, outlet: string): { product: string; wastePct: number } {
  const history = data.shop_history.filter((r) => r.outlet === outlet);
  const rates = data.products.map((product) => {
    const rows = history.filter((r) => r.product === product);
    const delivered = sum(rows.map((r) => r.units_delivered));
    return { product, wastePct: delivered === 0 ? 0 : (100 * sum(rows.map((r) => r.units_wasted))) / delivered };
  });
  return rates.reduce((worst, r) => (r.wastePct > worst.wastePct ? r : worst));
}
