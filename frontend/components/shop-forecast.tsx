import { ForecastExplorer } from "@/components/forecast-section";
import { Section } from "@/components/section";
import { testWeeks } from "@/lib/stats";
import type { ShopData } from "@/lib/types";

export function ShopForecast({ data, outlet }: { data: ShopData; outlet: string }) {
  return (
    <Section
      id="forecast"
      eyebrow="Accuracy"
      title="Forecast vs actual"
      intro={`Daily units over the last ${testWeeks(data.forecast_vs_actual)} weeks: what the model forecast, and what sold.`}
    >
      <ForecastExplorer data={data} fixedOutlet={outlet} />
    </Section>
  );
}
