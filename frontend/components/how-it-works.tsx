import { ChefHat, CloudSun, ClipboardCheck, Store, type LucideIcon } from "lucide-react";
import { Section } from "@/components/section";

type Step = { icon: LucideIcon; title: string; like: string; does: string };

// Each step: an everyday picture first, then what the model actually does.
const steps: Step[] = [
  {
    icon: Store,
    title: "It remembers, like a good shopkeeper",
    like: "Thursdays are busy. Rainy days are slow. Eid is huge.",
    does: "The model reads past sales for every shop and every day of the week. It also notes holidays and special offers.",
  },
  {
    icon: CloudSun,
    title: "It forecasts, like the weather",
    like: "About 14 cakes tomorrow, most likely between 9 and 18.",
    does: "For each shop, product and day it gives a best guess and a likely range. A forecast is a guide, not a promise.",
  },
  {
    icon: ChefHat,
    title: "It decides, like a baker",
    like: "Bake too many and some go in the bin. Bake too few and customers leave empty-handed.",
    does: "Cakes spoil fast, so we send close to the forecast. Biscuits keep for weeks, so a little extra is safe. Amounts are rounded to full boxes, like eggs sold by the tray.",
  },
  {
    icon: ClipboardCheck,
    title: "It checks itself, like a practice exam",
    like: "Mark last term's paper again, using the new answers.",
    does: "We replay recent weeks with the new amounts, against what customers really bought, and compare with what really happened.",
  },
];

export function HowItWorks() {
  return (
    <Section
      id="how"
      eyebrow="The idea"
      title="How it works"
      intro="Think of it as a weather forecast for each shop's shelves. Four simple ideas."
      className="pt-4 sm:pt-8"
    >
      <ol className="grid gap-4 sm:grid-cols-2 sm:gap-5">
        {steps.map(({ icon: Icon, title, like, does }, i) => (
          <li
            key={title}
            className="relative flex flex-col rounded-[1.25rem] border border-border bg-card p-6 shadow-card sm:p-7"
          >
            <span className="absolute right-6 top-6 text-sm font-medium text-muted-foreground tabular-nums sm:right-7">
              Idea {i + 1}
            </span>
            <span aria-hidden="true" className="grid size-11 place-items-center rounded-xl bg-brand/20 text-brand-ink">
              <Icon className="size-5" strokeWidth={1.75} />
            </span>
            <h3 className="mt-5 text-lg font-semibold leading-snug">{title}</h3>
            <p className="mt-3 border-l-2 border-brand pl-3.5 text-[15px] leading-relaxed text-foreground">{like}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">{does}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}
