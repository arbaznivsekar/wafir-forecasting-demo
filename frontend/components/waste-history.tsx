"use client";

import { useState } from "react";
import { ScrollTable } from "@/components/scroll-table";
import { Section } from "@/components/section";
import { SelectField } from "@/components/select-field";
import { TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { int, pct, shortDate } from "@/lib/format";
import { historyWeeks } from "@/lib/shop";
import { headCell, labelCell, labelHead, numCell } from "@/lib/table-styles";
import type { ShopData } from "@/lib/types";

const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
const share = (part: number, whole: number) => (whole === 0 ? 0 : (100 * part) / whole);
const weekLabel = (iso: string) => `Week of ${shortDate(iso)}`;

/** What was delivered and wasted, product by product for one week, and week by week for the shop. */
export function WasteHistory({ data, outlet }: { data: ShopData; outlet: string }) {
  const weeks = historyWeeks(data);
  const [week, setWeek] = useState(weeks[weeks.length - 1]);
  const history = data.shop_history.filter((r) => r.outlet === outlet);

  const products = data.products.map((product) => {
    const rows = history.filter((r) => r.product === product && r.week_start === week);
    return {
      product,
      delivered: sum(rows.map((r) => r.units_delivered)),
      wasted: sum(rows.map((r) => r.units_wasted)),
      outDays: sum(rows.map((r) => r.stockout_days)),
    };
  });
  const byWeek = weeks.map((w) => {
    const rows = history.filter((r) => r.week_start === w);
    return {
      week: w,
      delivered: sum(rows.map((r) => r.units_delivered)),
      wasted: sum(rows.map((r) => r.units_wasted)),
    };
  });
  const worstShare = Math.max(...byWeek.map((w) => share(w.wasted, w.delivered)));
  const shortWeek = Math.min(...history.filter((r) => r.week_start === week).map((r) => r.days_recorded)) < 7;

  return (
    <Section
      id="waste"
      eyebrow="The record"
      title="Waste and deliveries"
      intro={`What was delivered, what was wasted, and when a product ran out, over the last ${weeks.length} weeks.`}
    >
      <div className="space-y-6">
        <div className="rounded-2xl border border-border bg-card shadow-card p-4 sm:p-6">
          <div className="sm:max-w-xs">
            <SelectField
              id="waste-week"
              label="Week to look at"
              value={week}
              options={weeks}
              onChange={setWeek}
              display={weekLabel}
            />
          </div>
          <ScrollTable label={`Products for ${outlet}, ${weekLabel(week)}`} className="mt-5">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className={labelHead}>
                  Product
                </TableHead>
                <TableHead scope="col" className={headCell}>
                  Delivered
                </TableHead>
                <TableHead scope="col" className={headCell}>
                  Wasted
                </TableHead>
                <TableHead scope="col" className={headCell}>
                  Ran out
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.product}>
                  <TableHead scope="row" className={labelCell}>
                    {p.product}
                  </TableHead>
                  <TableCell className={numCell}>{int(p.delivered)}</TableCell>
                  <TableCell className={numCell}>
                    {int(p.wasted)}
                    <span className="block text-xs text-muted-foreground">{pct(share(p.wasted, p.delivered))}</span>
                  </TableCell>
                  <TableCell className={numCell}>
                    {int(p.outDays)} {p.outDays === 1 ? "day" : "days"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter className="bg-card">
              <TableRow className="hover:bg-transparent">
                <TableHead scope="row" className={`${labelCell} border-b-0`}>
                  Total
                </TableHead>
                <TableCell className={`${numCell} border-b-0 font-medium`}>
                  {int(sum(products.map((p) => p.delivered)))}
                </TableCell>
                <TableCell className={`${numCell} border-b-0 font-medium`}>
                  {int(sum(products.map((p) => p.wasted)))}
                </TableCell>
                <TableCell className={`${numCell} border-b-0`} />
              </TableRow>
            </TableFooter>
          </ScrollTable>
          {shortWeek && <p className="mt-3 text-sm text-muted-foreground">Some days were not recorded this week.</p>}
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card p-4 sm:p-6">
          <h3 className="text-base font-medium">Week by week</h3>
          <p className="mt-1 text-sm text-muted-foreground">All products together. The bar shows the share wasted.</p>
          <ScrollTable label={`Weekly totals for ${outlet}`} className="mt-4">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className={labelHead}>
                  Week starting
                </TableHead>
                <TableHead scope="col" className={headCell}>
                  Delivered
                </TableHead>
                <TableHead scope="col" className={headCell}>
                  Wasted
                </TableHead>
                <TableHead scope="col" className={headCell}>
                  Share wasted
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {byWeek.map((w) => (
                <TableRow key={w.week} data-selected={w.week === week} className="data-[selected=true]:bg-brand/10">
                  <TableHead scope="row" className={labelCell}>
                    {shortDate(w.week)}
                  </TableHead>
                  <TableCell className={numCell}>{int(w.delivered)}</TableCell>
                  <TableCell className={numCell}>{int(w.wasted)}</TableCell>
                  <TableCell className={numCell}>
                    {pct(share(w.wasted, w.delivered))}
                    <span aria-hidden="true" className="mt-1 block h-1 rounded-full bg-border">
                      <span
                        className="block h-full rounded-full bg-brand"
                        style={{ width: `${(100 * share(w.wasted, w.delivered)) / worstShare}%` }}
                      />
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ScrollTable>
        </div>
      </div>
    </Section>
  );
}
