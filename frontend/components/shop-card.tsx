import Link from "next/link";
import { ProductPhoto } from "@/components/product-photo";
import { int, pct } from "@/lib/format";
import { slugify, type ShopTotals } from "@/lib/shop";

type Props = {
  outlet: string;
  totals: ShopTotals;
  weeks: number;
  highestWaste: boolean;
  topProduct: { product: string; wastePct: number };
};

/** One clickable block on the shops page. */
export function ShopCard({ outlet, totals, weeks, highestWaste, topProduct }: Props) {
  return (
    <Link
      href={`/shops/${slugify(outlet)}`}
      className="group flex h-full flex-col rounded-[1.25rem] border border-border bg-card p-5 shadow-card transition-[box-shadow,transform] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-safe:hover:-translate-y-0.5 hover:shadow-lift sm:p-6"
    >
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold leading-snug">{outlet}</h2>
        {highestWaste && (
          <span className="shrink-0 rounded-full bg-brand/20 px-2.5 py-1 text-xs font-medium text-brand-ink">
            Highest waste
          </span>
        )}
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-4">
        <div>
          <dt className="text-sm text-muted-foreground">Wasted, {weeks} weeks</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{pct(totals.wastePct)}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Next week</dt>
          <dd className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">
            {int(totals.nextWeekUnits)} <span className="text-sm font-normal text-muted-foreground">units</span>
          </dd>
        </div>
      </dl>
      <div className="mt-6 flex items-center gap-3 border-t border-border pt-4">
        <ProductPhoto product={topProduct.product} sizes="44px" className="size-11 shrink-0 rounded-lg" />
        <p className="min-w-0 flex-1 text-sm leading-snug">
          <span className="block text-xs text-muted-foreground">Most wasted</span>
          <span className="block truncate font-medium">{topProduct.product}</span>
        </p>
        <span
          aria-hidden="true"
          className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background transition-transform motion-safe:group-hover:translate-x-0.5"
        >
          &rarr;
        </span>
      </div>
    </Link>
  );
}
