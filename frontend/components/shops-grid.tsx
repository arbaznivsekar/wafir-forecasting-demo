"use client";

import { useData } from "@/components/data-provider";
import { ShopCard } from "@/components/shop-card";
import { SectionSkeleton } from "@/components/states";
import { highestWasteShop, historyWeeks, mostWastedProduct, shopTotals } from "@/lib/shop";

export function ShopsGrid() {
  const data = useData();
  if (!data) return <SectionSkeleton className="mt-8 h-[40rem] w-full rounded-2xl sm:h-96" />;

  const weeks = historyWeeks(data).length;
  const worst = highestWasteShop(data);
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {data.outlets.map((outlet) => (
        <li key={outlet}>
          <ShopCard
            outlet={outlet}
            totals={shopTotals(data, outlet)}
            weeks={weeks}
            highestWaste={outlet === worst}
            topProduct={mostWastedProduct(data, outlet)}
          />
        </li>
      ))}
    </ul>
  );
}
