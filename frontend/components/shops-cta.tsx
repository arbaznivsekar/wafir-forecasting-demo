import Link from "next/link";
import { Section } from "@/components/section";

/** Sends the sales team from the overview to the shop-by-shop pages. */
export function ShopsCta() {
  return (
    <Section
      id="shops"
      eyebrow="Sales team"
      title="For the sales team"
      intro="Each shop has its own page: what it wasted, what it needs next week, and a forecast to check against real sales. Use it as the starting point when taking an order."
    >
      <Link
        href="/"
        className="inline-flex h-11 items-center rounded-lg bg-brand px-5 text-sm font-medium text-brand-foreground transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        View each shop
      </Link>
    </Section>
  );
}
