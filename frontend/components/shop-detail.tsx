import Link from "next/link";
import { DummyNote } from "@/components/dummy-note";
import { NextWeekNeeds } from "@/components/next-week-needs";
import { NotesList } from "@/components/notes-list";
import { ShopFigures } from "@/components/shop-figures";
import { ShopForecast } from "@/components/shop-forecast";
import { WasteHistory } from "@/components/waste-history";
import type { ShopData } from "@/lib/types";

/** Everything for one shop, in the order a salesperson needs it. The data is baked in at build time. */
export function ShopDetail({ outlet, data }: { outlet: string; data: ShopData }) {
  return (
    <main className="mx-auto max-w-5xl px-5 pb-8 pt-6 sm:pt-10">
      <Link
        href="/"
        className="inline-flex min-h-11 items-center text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <span aria-hidden="true">&larr;&nbsp;</span>All shops
      </Link>
      <div className="mt-2">
        <DummyNote />
      </div>
      <h1 className="mt-5 text-3xl font-semibold tracking-tight sm:text-5xl">{outlet}</h1>
      <ShopFigures data={data} outlet={outlet} />
      <NextWeekNeeds data={data} outlet={outlet} />
      <WasteHistory data={data} outlet={outlet} />
      <ShopForecast data={data} outlet={outlet} />
      <NotesList notes={data.notes} />
    </main>
  );
}
