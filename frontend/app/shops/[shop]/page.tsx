import type { Metadata } from "next";
import { notFound } from "next/navigation";
import data from "@/public/data.json"; // read at build time, only to list the shops
import { ShopDetail } from "@/components/shop-detail";
import { slugify } from "@/lib/shop";
import type { DashboardData, ShopData } from "@/lib/types";

const all: DashboardData = data;

/** Only this shop's rows, so the page carries just what it shows. */
function shopData(outlet: string): ShopData {
  const mine = <T extends { outlet: string }>(rows: T[]) => rows.filter((r) => r.outlet === outlet);
  return {
    outlets: [outlet],
    products: all.products,
    case_sizes: all.case_sizes,
    notes: all.notes,
    shop_history: mine(all.shop_history),
    last_week_daily: mine(all.last_week_daily),
    send_plan: mine(all.send_plan),
    forecast_vs_actual: mine(all.forecast_vs_actual),
  };
}

const outletFor = (slug: string): string | undefined => data.outlets.find((o) => slugify(o) === slug);

// Any shop that is not listed here is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return data.outlets.map((outlet) => ({ shop: slugify(outlet) }));
}

export async function generateMetadata({ params }: PageProps<"/shops/[shop]">): Promise<Metadata> {
  const outlet = outletFor((await params).shop);
  if (!outlet) return {};
  return {
    title: `${outlet} | Demand Forecasting Demo`,
    description: `Waste, next week's needs and forecast for ${outlet}. All data is dummy.`,
  };
}

export default async function ShopPage({ params }: PageProps<"/shops/[shop]">) {
  const outlet = outletFor((await params).shop);
  if (!outlet) notFound();
  return <ShopDetail outlet={outlet} data={shopData(outlet)} />;
}
