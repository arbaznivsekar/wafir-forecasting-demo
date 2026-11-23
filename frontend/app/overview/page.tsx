import type { Metadata } from "next";
import { DataProvider } from "@/components/data-provider";
import { ExampleRunSection } from "@/components/example-run";
import { ForecastSection } from "@/components/forecast-section";
import { HeadlineSection } from "@/components/headline-cards";
import { Hero } from "@/components/hero";
import { HowItWorks } from "@/components/how-it-works";
import { NotesSection } from "@/components/notes";
import { Pilot } from "@/components/pilot";
import { ShopsCta } from "@/components/shops-cta";
import { DataError } from "@/components/states";

export const metadata: Metadata = {
  title: "Overview | Demand Forecasting Demo",
  description:
    "How the forecast works, what the simulation shows, and how a pilot at Wafir would run. All data is dummy.",
};

export default function OverviewPage() {
  return (
    <>
      <Hero />
      <main id="results" className="mx-auto max-w-5xl scroll-mt-4 px-5">
        <DataProvider>
          <DataError />
          <HowItWorks />
          <HeadlineSection />
          <ExampleRunSection />
          <ForecastSection />
          <ShopsCta />
          <Pilot />
          <NotesSection />
        </DataProvider>
      </main>
    </>
  );
}
