import { Section } from "@/components/section";

const steps = [
  { title: "Share your data", text: "About 3 months of daily sales, deliveries, and returns for 2-3 outlets." },
  {
    title: "Run it alongside",
    text: "For 4 weeks, the model makes its plan next to your current method. Nothing changes in the shops.",
  },
  {
    title: "Compare and decide",
    text: "We compare waste % and stockouts, then decide together whether to go further.",
  },
];

type Need = { item: string; why?: string };

const toStart: Need[] = [
  {
    item: "Daily units sold, by shop and product",
    why: "If shops do not share sales, deliveries minus returns is a good stand-in.",
  },
  { item: "Daily units delivered, by shop and product" },
  { item: "Daily returns and waste, by shop and product" },
  { item: "Price and unit cost for each product" },
  { item: "Shelf life and box size for each product" },
  { item: "Promotion and holiday dates, and any days a shop was closed" },
];

const makesItBetter: Need[] = [
  { item: "Days a product sold out", why: "Sales only show what sold, not what shoppers wanted." },
  { item: "Stock the shop already holds on delivery day", why: "Packaged items need this to avoid over-sending." },
  { item: "Who pays for unsold stock", why: "Return and credit terms decide how much extra is worth sending." },
  { item: "Delivery days, order cut-off times and minimum order sizes, by shop" },
  {
    item: "What the sales team ordered, next to what was delivered",
    why: "This is the current method we compare against.",
  },
  {
    item: "New shops, new products, price changes and shop refits",
    why: "So a sudden change is not mistaken for a trend.",
  },
];

function NeedList({ title, items }: { title: string; items: Need[] }) {
  return (
    <div>
      <h4 className="text-sm font-semibold">{title}</h4>
      <ul className="mt-3 space-y-3 text-sm leading-relaxed">
        {items.map(({ item, why }) => (
          <li key={item} className="flex gap-2.5">
            <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
            <span>
              {item}
              {why && <span className="block text-muted-foreground">{why}</span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Pilot() {
  return (
    <Section id="pilot" eyebrow="Next step" title="How this would work at Wafir" intro="A small pilot, in three steps.">
      <ol className="grid gap-4 md:grid-cols-3">
        {steps.map((step, i) => (
          <li key={step.title} className="rounded-2xl border border-border bg-card shadow-card p-5">
            <p className="text-sm font-medium text-brand-ink tabular-nums">Step {i + 1}</p>
            <h3 className="mt-2 font-medium">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
          </li>
        ))}
      </ol>
      <h3 className="mt-12 text-lg font-semibold">Data needed</h3>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        About 3 months of daily data is enough to start. A year or more lets the model learn Ramadan and Eid.
      </p>
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <NeedList title="To start" items={toStart} />
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card sm:p-6">
          <NeedList title="Makes it more accurate" items={makesItBetter} />
        </div>
      </div>
    </Section>
  );
}
