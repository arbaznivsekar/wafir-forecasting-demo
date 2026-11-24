// Types written from the real /public/data.json produced by the Python pipeline.

export type BeforeAfter = { before: number; after: number };
export type Spread = { mean: number; min: number; max: number };

export type ForecastRow = {
  date: string;
  outlet: string;
  product: string;
  forecast: number;
  forecast_low: number;
  forecast_high: number;
  actual: number;
};

export type ShopHistoryRow = {
  outlet: string;
  product: string;
  week_start: string;
  units_delivered: number;
  units_sold: number;
  units_wasted: number;
  waste_cost_kwd: number;
  stockout_days: number;
  days_recorded: number;
};

export type LastWeekDailyRow = {
  date: string;
  outlet: string;
  product: string;
  units_sent: number;
  units_sold: number;
  units_wasted: number;
};

export type SendPlanRow = {
  /** Stock assumed to be in the shop at the start of the day. Only packaged items carry stock. */
  stock_on_hand: number;
  date: string;
  outlet: string;
  product: string;
  forecast: number;
  units: number;
};

export type DashboardData = {
  meta: { note: string; generated_on: string; currency: string };
  outlets: string[];
  products: string[];
  summary: {
    waste_pct: BeforeAfter;
    stockout_pct: BeforeAfter;
    kwd_saved: number;
    margin_kwd: BeforeAfter;
    waste_cost_kwd: BeforeAfter;
    lost_margin_kwd: BeforeAfter;
    mae: { baseline: number; model: number };
  };
  robustness: {
    runs: number;
    waste_cut_pct: Spread;
    stockout_change_pts: Spread;
    kwd_saved: Spread;
  };
  notes: string[];
  /** Units in one box, by product. Suggested amounts are whole boxes. */
  case_sizes: Record<string, number>;
  by_outlet: { outlet: string; waste_pct_before: number; waste_pct_after: number }[];
  by_product: { product: string; waste_pct_before: number; waste_pct_after: number }[];
  forecast_vs_actual: ForecastRow[];
  shop_history: ShopHistoryRow[];
  last_week_daily: LastWeekDailyRow[];
  send_plan: SendPlanRow[];
};

/** The part of the data one shop page needs. It is cut out at build time so the page ships with its content. */
export type ShopData = Pick<
  DashboardData,
  | "outlets"
  | "products"
  | "case_sizes"
  | "notes"
  | "shop_history"
  | "last_week_daily"
  | "send_plan"
  | "forecast_vs_actual"
>;
