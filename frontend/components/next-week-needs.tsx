import { ProductLabel } from "@/components/product-label";
import { ProductPhoto } from "@/components/product-photo";
import { ScrollTable } from "@/components/scroll-table";
import { Section } from "@/components/section";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { boxCount, boxLabel, dec1, int, longDate, shortDate } from "@/lib/format";
import { nextWeekNeeds, type NeedRow } from "@/lib/shop";
import { headCell, numCell, stickyLabel, stickyLabelHead } from "@/lib/table-styles";
import type { ShopData } from "@/lib/types";

const boxes = (count: number, size: number) => `${int(count)} ${count === 1 ? "box" : "boxes"} of ${size}`;

/** One product: photo, what it sells each day, and how much to send for the week. */
function NeedCard({ row }: { row: NeedRow }) {
  return (
    <li className="rounded-2xl border border-border bg-card p-2 shadow-card sm:p-2.5">
      <ProductPhoto product={row.product} sizes="(min-width: 1024px) 270px, (min-width: 640px) 30vw, 45vw" />
      <div className="px-1.5 pb-1.5 pt-3">
        <h3 className="font-semibold leading-snug">{row.product}</h3>
        <dl className="mt-2 flex items-end justify-between gap-2">
          <div>
            <dt className="text-xs text-muted-foreground">Per day</dt>
            <dd className="text-base font-medium tabular-nums">{dec1(row.perDay)}</dd>
          </div>
          <div className="text-right">
            <dt className="text-xs text-muted-foreground">To send</dt>
            <dd className="text-xl font-semibold tabular-nums text-brand-ink">{int(row.units)}</dd>
          </div>
        </dl>
        <p className="mt-1 text-right text-xs text-muted-foreground">{boxes(row.boxes, row.boxSize)}</p>
        {row.stockOnHand > 0 && (
          <p className="text-right text-xs text-muted-foreground">Counts {int(row.stockOnHand)} already in the shop</p>
        )}
        <p className="mt-2 border-t border-border pt-2 text-xs leading-relaxed text-muted-foreground tabular-nums">
          Last week: sent {int(row.lastWeek.sent)} · sold {int(row.lastWeek.sold)} · wasted {int(row.lastWeek.wasted)}
        </p>
      </div>
    </li>
  );
}

/** What the shop is expected to sell each day, and how much to send for the week. */
export function NextWeekNeeds({ data, outlet }: { data: ShopData; outlet: string }) {
  const { dates, rows } = nextWeekNeeds(data, outlet);
  const plan = data.send_plan.filter((r) => r.outlet === outlet);
  const totalPerDay = rows.reduce((a, r) => a + r.perDay, 0);
  const totalUnits = rows.reduce((a, r) => a + r.units, 0);
  const totalBoxes = rows.reduce((a, r) => a + r.boxes, 0);
  const lookup = (product: string, date: string) => plan.find((r) => r.product === product && r.date === date);
  const lastRows = data.last_week_daily.filter((r) => r.outlet === outlet);
  const lastDates = [...new Set(lastRows.map((r) => r.date))].sort();
  const lastLookup = (product: string, date: string) => lastRows.find((r) => r.product === product && r.date === date);

  return (
    <Section
      id="needs"
      eyebrow="The order"
      title="What it needs next week"
      intro={`Expected sales each day, and how much to send for ${shortDate(dates[0])} to ${shortDate(dates[dates.length - 1])}. Amounts are whole boxes.`}
    >
      <p
        aria-label="Totals for all products"
        className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 rounded-2xl border border-border bg-card px-5 py-4 shadow-card"
      >
        <span className="text-sm text-muted-foreground">
          All products sell about <span className="font-medium tabular-nums text-foreground">{dec1(totalPerDay)}</span>{" "}
          a day
        </span>
        <span className="text-sm text-muted-foreground">
          Send in total <span className="text-xl font-semibold tabular-nums text-brand-ink">{int(totalUnits)}</span>{" "}
          units, <span className="font-medium tabular-nums text-foreground">{boxLabel(totalBoxes)}</span>
        </span>
      </p>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {rows.map((row) => (
          <NeedCard key={row.product} row={row} />
        ))}
      </ul>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
        Expected sales are estimates, not promises. Packaged items already count the stock shown on each card; if the
        real stock is different, adjust the amount.
      </p>

      <details className="group mt-5 rounded-2xl border border-border bg-card shadow-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 font-medium sm:px-6 [&::-webkit-details-marker]:hidden">
          How each amount adds up
          <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-180">
            &#8964;
          </span>
        </summary>
        <div className="px-4 pb-4 sm:px-6 sm:pb-6">
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            The amount to send is the expected sales, plus a safety margin, minus any stock already on the shelf,
            rounded to whole boxes.
          </p>
          <ScrollTable label={`Last week and next week for ${outlet}`}>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead scope="col" className={stickyLabelHead}>
                  Product
                </TableHead>
                {[
                  "Sent last week",
                  "Sold last week",
                  "Wasted last week",
                  "Expected sales",
                  "On the shelf",
                  "To send",
                  "Boxes to send",
                ].map((label, i) => (
                  <TableHead
                    key={label}
                    scope="col"
                    className={`${headCell} whitespace-nowrap ${i === 3 ? "border-l border-border" : ""} ${i >= 5 ? "text-brand-ink" : ""}`}
                  >
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.product}>
                  <TableHead scope="row" className={stickyLabel}>
                    <ProductLabel product={r.product} boxSize={r.boxSize} />
                  </TableHead>
                  <TableCell className={numCell}>{int(r.lastWeek.sent)}</TableCell>
                  <TableCell className={numCell}>{int(r.lastWeek.sold)}</TableCell>
                  <TableCell className={numCell}>{int(r.lastWeek.wasted)}</TableCell>
                  <TableCell className={`${numCell} border-l border-border`}>{dec1(r.weekSales)}</TableCell>
                  <TableCell className={numCell}>{int(r.stockOnHand)}</TableCell>
                  <TableCell className={`${numCell} font-semibold text-brand-ink`}>{int(r.units)}</TableCell>
                  <TableCell className={`${numCell} font-semibold text-brand-ink`}>{boxCount(r.boxes)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </ScrollTable>
        </div>
      </details>

      <details className="group mt-5 rounded-2xl border border-border bg-card shadow-card">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-4 py-2 font-medium sm:px-6 [&::-webkit-details-marker]:hidden">
          Day by day
          <span aria-hidden="true" className="text-muted-foreground transition-transform group-open:rotate-180">
            &#8964;
          </span>
        </summary>
        <div className="space-y-5 px-4 pb-4 sm:px-6 sm:pb-6">
          {[
            {
              title: "Sold last week",
              days: lastDates,
              value: (p: string, d: string) => lastLookup(p, d)?.units_sold ?? 0,
              show: int,
            },
            {
              title: "Expected sales next week",
              days: dates,
              value: (p: string, d: string) => lookup(p, d)?.forecast ?? 0,
              show: dec1,
            },
            {
              title: "Suggested to send next week",
              days: dates,
              value: (p: string, d: string) => lookup(p, d)?.units ?? 0,
              show: int,
              inBoxes: true,
            },
          ].map(({ title, days, value, show, inBoxes }) => (
            <div key={title}>
              <h3 className="mb-2 text-sm font-medium text-muted-foreground">{title}</h3>
              <ScrollTable label={`${title} by day for ${outlet}`}>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead scope="col" className={stickyLabelHead}>
                      Product
                    </TableHead>
                    {days.map((d) => (
                      <TableHead key={d} scope="col" className={`${headCell} whitespace-nowrap`}>
                        {longDate(d)}
                      </TableHead>
                    ))}
                    <TableHead
                      scope="col"
                      className={`${headCell} whitespace-nowrap border-l border-border text-brand-ink`}
                    >
                      Week
                    </TableHead>
                    {inBoxes && (
                      <TableHead scope="col" className={`${headCell} whitespace-nowrap text-brand-ink`}>
                        Boxes
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.products.map((product) => (
                    <TableRow key={product}>
                      <TableHead scope="row" className={stickyLabel}>
                        {inBoxes ? <ProductLabel product={product} boxSize={data.case_sizes[product]} /> : product}
                      </TableHead>
                      {days.map((d) => (
                        <TableCell key={d} className={numCell}>
                          {show(value(product, d))}
                        </TableCell>
                      ))}
                      <TableCell className={`${numCell} border-l font-semibold text-brand-ink`}>
                        {show(days.reduce((total, d) => total + value(product, d), 0))}
                      </TableCell>
                      {inBoxes && (
                        <TableCell className={`${numCell} font-semibold text-brand-ink`}>
                          {boxCount(days.reduce((total, d) => total + value(product, d), 0) / data.case_sizes[product])}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </ScrollTable>
            </div>
          ))}
        </div>
      </details>
    </Section>
  );
}
