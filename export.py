"""Turns the results written by main.py into frontend/public/data.json (no recomputation)."""
import json
from datetime import date
from pathlib import Path

import pandas as pd

from main import PRODUCTS  # case-pack sizes live in one place only

XLSX = "output.xlsx"
summary = pd.read_excel(XLSX, sheet_name="Summary", usecols="A:C")
robust = pd.read_excel(XLSX, sheet_name="Summary", usecols="F:J").dropna(how="all").set_index("measure")
bva = pd.read_excel(XLSX, sheet_name="Before vs After")
plan = pd.read_excel(XLSX, sheet_name="Next Week Send Plan")
fc = pd.read_csv("test_forecast.csv")
history = pd.read_csv("data.csv", parse_dates=["date"])

metric = summary.dropna(subset=["metric"]).set_index("metric")
# Notes live in the workbook (rows with no numbers) so the app and the Excel file can never disagree.
notes = metric.index[metric.baseline.isna() & metric.model.isna()].tolist()
note = next(n for n in notes if n.startswith("All data is dummy"))
overall = bva[bva.level == "Overall"].iloc[0]
outlets, products = bva[bva.level == "Outlet"], bva[bva.level == "Product"]


def pair(name):
    return {"before": float(metric.loc[name, "baseline"]), "after": float(metric.loc[name, "model"])}


def spread(name):
    r = robust.loc[name]
    return {"mean": float(r["mean"]), "min": float(r["min"]), "max": float(r["max"])}


def before_after(rows, key):
    return [{key: r["name"], "waste_pct_before": float(r.waste_pct_before), "waste_pct_after": float(r.waste_pct_after)}
            for _, r in rows.iterrows()]


def weekly_history():
    """Delivered and wasted units per shop and product, week by week, over the test period."""
    first = pd.to_datetime(fc["date"]).min()
    recent = history[history["date"] >= first].copy()
    recent["waste_cost_kwd"] = recent["units_wasted"] * recent["unit_cost_kwd"]
    # Weeks run in blocks of 7 days from the first test day (a Monday).
    recent["week_start"] = first + pd.to_timedelta((recent["date"] - first).dt.days // 7 * 7, unit="D")
    weekly = (
        recent.groupby(["outlet", "product", "week_start"])
        .agg(
            units_delivered=("units_sent", "sum"),
            units_wasted=("units_wasted", "sum"),
            waste_cost_kwd=("waste_cost_kwd", "sum"),
            stockout_days=("stockout", "sum"),
            days_recorded=("date", "nunique"),
        )
        .reset_index()
    )
    weekly["waste_cost_kwd"] = weekly["waste_cost_kwd"].round(2)
    weekly["week_start"] = weekly["week_start"].dt.strftime("%Y-%m-%d")
    return weekly.astype({"units_delivered": int, "units_wasted": int, "stockout_days": int, "days_recorded": int}).to_dict("records")


data = {
    "meta": {"note": note, "generated_on": date.today().isoformat(), "currency": "KWD"},
    "outlets": outlets["name"].tolist(),
    "products": products["name"].tolist(),
    "summary": {
        "waste_pct": {"before": float(overall.waste_pct_before), "after": float(overall.waste_pct_after)},
        "stockout_pct": {"before": float(overall.stockout_pct_before), "after": float(overall.stockout_pct_after)},
        "kwd_saved": float(overall.kwd_saved),
        "margin_kwd": pair("Gross margin (KWD)"),
        "waste_cost_kwd": pair("Waste cost (KWD)"),
        "lost_margin_kwd": pair("Lost margin on stockouts (KWD)"),
        "mae": {"baseline": float(metric.loc["MAE (units)", "baseline"]), "model": float(metric.loc["MAE (units)", "model"])},
    },
    "robustness": {
        "runs": int(robust["runs"].iloc[0]),
        "waste_cut_pct": spread("Waste cut %"),
        "stockout_change_pts": spread("Stockout change (pts)"),
        "kwd_saved": spread("KWD saved"),
    },
    "notes": [n.rstrip(".") for n in notes],
    "by_outlet": before_after(outlets, "outlet"),
    "by_product": before_after(products, "product"),
    "forecast_vs_actual": fc[["date", "outlet", "product", "forecast", "forecast_low", "forecast_high", "actual"]].to_dict("records"),
    "case_sizes": {name: int(info[1]) for name, info in PRODUCTS.items()},
    "shop_history": weekly_history(),
    "send_plan": plan.rename(columns={"recommended_send_units": "units"})[["date", "outlet", "product", "forecast", "units"]].to_dict("records"),
}

out = Path("frontend/public/data.json")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(data, indent=2))
print(f"Wrote {out}")
