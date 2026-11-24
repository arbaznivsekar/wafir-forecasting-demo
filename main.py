"""Wafir demand forecasting demo. ALL DATA IS SYNTHETIC.

Generates data, runs the baseline send rule and a LightGBM forecast, replays the
last 6 weeks with the recommended quantities, and writes output.xlsx.
"""
import numpy as np
import pandas as pd
import lightgbm as lgb

N_RUNS = 20  # seeds 0..19; seed 0 drives every chart and table, the rest only measure robustness
START = pd.Timestamp("2026-01-05")  # a Monday
WEEKS, TRAIN_WEEKS, HORIZON = 26, 20, 7
D = WEEKS * 7  # days of history
TRAIN_END = TRAIN_WEEKS * 7  # first test day index
NOTES = ["units_sent is the shipment size; packaged items also sell from carried-over stock",
         "Packaged item send plan counts stock on hand, which comes from the simulation here; real stock counts should replace it",
         "Savings depend on how Wafir decides what to send today; if the current method already rounds to the nearest box, they would be much smaller",
         "After a sudden drop in demand, such as the summer slowdown, the forecast takes about two weeks to catch up and runs high; a year of real data would let it learn seasonal dips",
         "All data is dummy and results are illustrative."]

# --- Data-generation knobs -------------------------------------------------
NB_R = 25            # NegBin dispersion: smaller = noisier. Var = mu + mu^2/r
TREND = 0.0004       # slow growth per day
EXPIRY_RATE = 0.01   # share of carried packaged stock lost to expiry per day
ORDER_NOISE = 0.05   # human over/under-shoot on the baseline order (sd)
ROUND_UP_FROM = 0.35  # cakes/pastry: send the next box only once this share of it is needed
CUSHION = 1.10       # baseline adds 10% on top of the 4-week average
N_WEATHER, N_NEARBY, N_SUPPLIER, N_MISSING = 3, 4, 6, 4
PROMO_START = START + pd.Timedelta(weeks=14)  # inside training so the model can learn it
WEEKDAY = np.array([0.90, 0.85, 0.95, 1.30, 1.45, 1.05, 0.90])  # Mon..Sun, Thu/Fri peak

OUTLETS = {"Mall Kiosk": 1.0, "Supermarket": 1.6, "Co-op": 1.2,
           "Petrol Station Shop": 0.7, "Small Grocery": 0.5}  # demand scale
# name: (shelf_days, case_pack, price_kwd, unit_cost_kwd, base daily demand)
PRODUCTS = {"Chocolate Cake": (3, 6, 3.500, 1.60, 14), "Vanilla Cake": (3, 6, 3.000, 1.35, 12),
            "Cheese Pastry": (4, 12, 0.600, 0.22, 30), "Date Cookies": (60, 24, 1.200, 0.65, 22),
            "Butter Biscuits": (60, 24, 0.900, 0.45, 26), "Mini Muffins": (60, 24, 1.500, 0.80, 18)}
O, P = len(OUTLETS), len(PRODUCTS)
SHELF = np.array([v[0] for v in PRODUCTS.values()])
PACK = np.array([v[1] for v in PRODUCTS.values()])
PRICE = np.array([v[2] for v in PRODUCTS.values()])
COST = np.array([v[3] for v in PRODUCTS.values()])
BASE_MEAN = np.array(list(OUTLETS.values()))[:, None] * np.array([v[4] for v in PRODUCTS.values()])[None, :]
SHORT = SHELF <= 4  # short-life items are written off daily; long-life carry over

FEATURES = ["weekday", "week_of_year", "holiday_flag", "promo_flag", "roll7", "roll14", "outlet", "product"]
CATS = ["outlet", "product"]
LGB = dict(learning_rate=0.05, num_leaves=7, min_data_in_leaf=40, feature_fraction=0.9,
           verbose=-1, deterministic=True, force_row_wise=True, num_threads=1)


# --- 1. Synthetic world ----------------------------------------------------
def calendar(dates):
    """Event flags and demand multipliers. Dates are Gregorian approximations of the 2026 events."""
    d = pd.DatetimeIndex(dates)
    ramadan = (d >= "2026-02-18") & (d <= "2026-03-19")
    eid_fitr = (d >= "2026-03-20") & (d <= "2026-03-22")
    eid_adha = (d >= "2026-05-27") & (d <= "2026-05-30")
    promo = (d >= PROMO_START) & (d < PROMO_START + pd.Timedelta(weeks=1))
    summer = d >= "2026-06-15"  # people travel, fewer shoppers
    # Sweets spike harder than shelf-stable packaged goods around Ramadan/Eid.
    sweet = np.select([eid_fitr, eid_adha, ramadan], [1.6, 1.4, 1.25], 1.0)
    pack = np.select([eid_fitr, eid_adha, ramadan], [1.3, 1.2, 1.1], 1.0)
    common = (1 + 0.3 * promo) * (1 - 0.15 * summer)
    event = np.where(SHORT[None, :], sweet[:, None], pack[:, None]) * common[:, None]
    # holiday_flag marks Eid days only; Ramadan is a gradual lift the rolling features pick up.
    return (eid_fitr | eid_adha).astype(int), promo.astype(int), event


def make_world(seed):
    rng = np.random.default_rng([seed, 0])
    dates = START + pd.to_timedelta(np.arange(D + HORIZON), unit="D")
    hol, promo, event = calendar(dates)
    trend = 1 + TREND * np.arange(D + HORIZON)
    mean = BASE_MEAN[None] * (WEEKDAY[np.asarray(dates.day_of_week)] * trend)[:, None, None] * event[:, None, :]

    # Rare disruptions the model is never told about; they hit both arms of the replay equally.
    mult = np.ones((D, O, P))
    mult[rng.choice(np.arange(7, D), N_WEATHER, replace=False)] *= 0.7  # weather day: everyone
    for _ in range(N_NEARBY):  # nearby event: one outlet gets a crowd
        mult[rng.integers(7, D), rng.integers(O)] *= 1.6
    frac = np.ones((D, O, P))  # supplier delay: only part of the order arrives
    for _ in range(N_SUPPLIER):
        frac[rng.integers(7, D), rng.integers(O), rng.integers(P)] = 0.4

    mu = mean[:D] * mult
    demand = rng.negative_binomial(NB_R, NB_R / (NB_R + mu))  # overdispersed counts, not Gaussian
    miss = np.zeros((D, O), dtype=bool)  # POS outage: rows lost at one outlet, shop still traded
    miss[rng.choice(np.arange(14, D), N_MISSING, replace=False), list(OUTLETS).index("Petrol Station Shop")] = True
    noise = rng.normal(0, ORDER_NOISE, (D, O, P))
    return dict(seed=seed, dates=dates, hol=hol, promo=promo, demand=demand, frac=frac, miss=miss, noise=noise)


# --- 2. Inventory simulation (shared by history and replay) ----------------
def to_packs(need):
    """Round up to whole case packs. A stockout costs more than a few spare units."""
    return (np.ceil(np.maximum(need, 0) / PACK - 1e-9) * PACK).astype(int)


def to_boxes(need):
    """Recommended amounts in whole boxes. The current method always rounds up (see to_packs); we do not.

    Cakes and pastry go bad overnight, so the next box is only sent once ROUND_UP_FROM of it is needed: a need of 13
    with boxes of 12 is one box, not two. Packaged items still round up, because leftovers carry over and running out
    costs more than a spare unit."""
    boxes = np.maximum(need, 0) / PACK
    whole = np.floor(boxes + 1e-9)
    fresh = whole + ((boxes - whole) >= ROUND_UP_FROM)
    return (np.where(SHORT[None, :], fresh, np.ceil(boxes - 1e-9)) * PACK).astype(int)


def run(w, sender):
    """Day-by-day stock simulation. `sender` decides the order from info available that morning."""
    carry = np.zeros((O, P), dtype=int)
    rng = np.random.default_rng([w["seed"], 1])  # same expiry stream in baseline and replay
    keys = ("sent", "sold", "wasted", "stockout")
    out = {k: np.zeros((D, O, P), dtype=int) for k in keys}
    obs = np.full((D, O, P), np.nan)  # sales as recorded (NaN on POS-outage days)
    for d in range(D):
        sent = np.floor(sender(d, obs, carry) * w["frac"][d]).astype(int)
        avail = sent + carry
        sold = np.minimum(w["demand"][d], avail)
        left = avail - sold
        expiry = rng.binomial(left, EXPIRY_RATE)
        out["sent"][d], out["sold"][d], out["stockout"][d] = sent, sold, w["demand"][d] > avail
        out["wasted"][d] = np.where(SHORT[None, :], left, expiry)
        carry = np.where(SHORT[None, :], 0, left - expiry)
        obs[d] = np.where(w["miss"][d][:, None], np.nan, sold)
    return out | {"obs": obs, "stock_end": carry}


def baseline_sender(w):
    """Current practice: mean of last 4 same weekdays + 10%, rounded up to case packs."""
    def send(d, obs, carry):
        lags = [obs[d - k] for k in (7, 14, 21, 28) if d - k >= 0]
        avg = BASE_MEAN
        if lags:
            arr = np.stack(lags)
            cnt = (~np.isnan(arr)).sum(0)
            avg = np.where(cnt > 0, np.nansum(arr, 0) / np.maximum(cnt, 1), BASE_MEAN)
        # Long-life stock already on the shelf is netted off, otherwise it piles up unrealistically.
        return to_packs(avg * CUSHION * (1 + w["noise"][d]) - carry)
    return send


def recommended_sender(w, target):
    base = baseline_sender(w)

    def send(d, obs, carry):
        return base(d, obs, carry) if d < TRAIN_END else to_boxes(target[d] - carry)
    return send


def to_frame(w, r):
    d, o, p = np.indices((D, O, P)).reshape(3, -1)
    return pd.DataFrame({
        "d": d, "date": w["dates"][d], "outlet": np.array(list(OUTLETS))[o], "product": np.array(list(PRODUCTS))[p],
        "units_sent": r["sent"].ravel(), "units_sold": r["sold"].ravel(), "units_wasted": r["wasted"].ravel(),
        "stockout": r["stockout"].ravel(), "price_kwd": PRICE[p], "unit_cost_kwd": COST[p],
        "holiday_flag": w["hol"][d], "promo_flag": w["promo"][d],
        "true_demand": w["demand"].ravel(),  # hidden: simulation and KWD scoring only, never a feature
        "missing": w["miss"][d, o]})


# --- 3. Features and forecasting -------------------------------------------
def build_grid(w, obs):
    """One row per day/outlet/product, including the 7 days after the data ends."""
    n = D + HORIZON
    flat = pd.DataFrame(np.vstack([obs, np.full((HORIZON, O, P), np.nan)]).reshape(n, -1))
    # Everything is shifted by 7 days: a row only sees sales at least a week old, so the weekly
    # plan needs no recursive forecasting and nothing leaks from the day being predicted.
    lag = flat.shift(7)
    r7 = lag.rolling(7, min_periods=3).mean()
    r14 = lag.rolling(14, min_periods=5).mean()
    base4 = pd.concat([flat.shift(k) for k in (7, 14, 21, 28)]).groupby(level=0).mean()
    d, o, p = np.indices((n, O, P)).reshape(3, -1)
    woy = w["dates"].isocalendar().week.to_numpy().astype(int)
    return pd.DataFrame({
        "d": d, "o": o, "p": p, "weekday": np.asarray(w["dates"].day_of_week)[d], "week_of_year": woy[d],
        "holiday_flag": w["hol"][d], "promo_flag": w["promo"][d],
        "roll7": r7.to_numpy().ravel(), "roll14": r14.to_numpy().ravel(), "base4": base4.to_numpy().ravel(),
        "outlet": pd.Categorical.from_codes(o, list(OUTLETS)), "product": pd.Categorical.from_codes(p, list(PRODUCTS)),
        "sold": np.vstack([obs, np.full((HORIZON, O, P), np.nan)]).ravel()})


def cost_ratio_quantiles():
    """Newsvendor: serve demand up to the point where one more unit's expected gain equals its loss."""
    under = PRICE - COST
    over = np.where(SHORT, COST, 0.2 * COST)  # long-life leftovers can still be sold later
    return np.clip(under / (under + over), 0.5, 0.95)


def forecast(X, seed):
    # Last 2 weeks have no full rolling window yet; chronological split by day index.
    train = X[(X.d < TRAIN_END) & X.sold.notna() & X.roll14.notna()]
    future = X[X.d >= TRAIN_END].copy()  # test weeks + the 7 plan days

    def fit(rows, rounds, **obj):
        return lgb.train({**LGB, "seed": seed, **obj}, lgb.Dataset(rows[FEATURES], rows.sold, categorical_feature=CATS), rounds)

    future["point"] = fit(train, 300, objective="poisson").predict(future[FEATURES])
    future["low"] = fit(train, 200, objective="quantile", alpha=0.1).predict(future[FEATURES])
    future["high"] = fit(train, 200, objective="quantile", alpha=0.9).predict(future[FEATURES])
    future["target"] = 0.0
    for p, q in enumerate(cost_ratio_quantiles()):  # one model per product, each at its own quantile
        idx = future.p == p
        future.loc[idx, "target"] = fit(train[train.p == p], 200, objective="quantile", alpha=q).predict(future.loc[idx, FEATURES])
    # Independently trained quantile models can cross; keep low <= point <= high.
    future["low"] = np.minimum(future.low, future.point).clip(lower=0)
    future["high"] = np.maximum(future.high, future.point)
    future["target"] = future.target.clip(lower=0)
    return future


# --- 4. Metrics ------------------------------------------------------------
def metrics(f):
    unit_margin = f.price_kwd - f.unit_cost_kwd
    waste_cost = (f.units_wasted * f.unit_cost_kwd).sum()
    lost_margin = ((f.true_demand - f.units_sold) * unit_margin).sum()  # margin missed on unmet demand
    margin = (f.units_sold * unit_margin).sum() - waste_cost
    return {"waste": 100 * f.units_wasted.sum() / f.units_sent.sum(), "stockout": 100 * f.stockout.mean(),
            "waste_cost": waste_cost, "lost_margin": lost_margin, "lost": waste_cost + lost_margin, "margin": margin}


def compare(before, after):
    rows = []
    for level, key, names in [("Overall", None, ["All"]), ("Outlet", "outlet", list(OUTLETS)), ("Product", "product", list(PRODUCTS))]:
        for n in names:
            b, a = (before, after) if key is None else (before[before[key] == n], after[after[key] == n])
            mb, ma = metrics(b), metrics(a)
            rows.append({"level": level, "name": n,
                         "waste_pct_before": mb["waste"], "waste_pct_after": ma["waste"],
                         "stockout_pct_before": mb["stockout"], "stockout_pct_after": ma["stockout"],
                         "kwd_lost_before": mb["lost"], "kwd_lost_after": ma["lost"], "kwd_saved": mb["lost"] - ma["lost"],
                         "margin_kwd_before": mb["margin"], "margin_kwd_after": ma["margin"],
                         "waste_cost_kwd_before": mb["waste_cost"], "waste_cost_kwd_after": ma["waste_cost"],
                         "lost_margin_kwd_before": mb["lost_margin"], "lost_margin_kwd_after": ma["lost_margin"]})
    return pd.DataFrame(rows).round(2)




def next_week_plan(target, point, opening):
    """Roll next week forward day by day, ordering exactly as the replay does: top up to the target, minus stock on hand.

    Adding up each day's target instead would count the same packaged stock several times over."""
    stock = opening.astype(float)
    send = np.zeros((HORIZON, O, P), dtype=int)
    start = np.zeros((HORIZON, O, P))
    for i in range(HORIZON):
        d = D + i
        start[i] = stock
        send[i] = to_boxes(target[d] - stock)
        # Fresh items are written off each night; packaged items carry on what the forecast says will not sell.
        stock = np.where(SHORT[None, :], 0, np.maximum(stock + send[i] - point[d], 0))
    return send, start


def pipeline(seed):
    """Everything for one seed: generate, baseline, forecast, replay, compare."""
    w = make_world(seed)
    hist = run(w, baseline_sender(w))
    full = to_frame(w, hist)

    X = build_grid(w, hist["obs"])
    fut = forecast(X, seed)
    target = np.zeros((D + HORIZON, O, P))
    point = np.zeros((D + HORIZON, O, P))
    target[fut.d, fut.o, fut.p] = fut.target
    point[fut.d, fut.o, fut.p] = fut.point
    plan_send, plan_stock = next_week_plan(target, point, hist["stock_end"])

    # Replay: same demand, disruptions and opening stock; only the send rule changes after week 20.
    replay = to_frame(w, run(w, recommended_sender(w, target)))
    keep = (full.d >= TRAIN_END) & ~full.missing
    before, after = full[keep], replay[keep]
    mb, ma = metrics(before), metrics(after)  # unrounded, so the 20-seed stats aren't rounded twice

    M = X.merge(fut[["d", "o", "p", "point", "low", "high", "target"]], on=["d", "o", "p"])
    test = M[(M.d >= TRAIN_END) & (M.d < D) & M.sold.notna() & M.base4.notna()]
    err_m, err_b = (test.point - test.sold).abs(), (test.base4 - test.sold).abs()
    return dict(
        w=w, full=full, M=M, test=test, table=compare(before, after), mb=mb, ma=ma, plan_send=plan_send, plan_stock=plan_stock,
        mae=(err_b.mean(), err_m.mean()), wape=(100 * err_b.sum() / test.sold.sum(), 100 * err_m.sum() / test.sold.sum()),
        waste_cut=100 * (mb["waste"] - ma["waste"]) / mb["waste"],
        stockout_change=ma["stockout"] - mb["stockout"],  # percentage points, + means more stockouts
        kwd_saved=mb["lost"] - ma["lost"])


def main():
    runs = [pipeline(seed) for seed in range(N_RUNS)]
    r = runs[0]  # seed 0 drives every file below
    w, full, M, test, table = r["w"], r["full"], r["M"], r["test"], r["table"]
    overall, mb, ma = table.iloc[0], r["mb"], r["ma"]

    cols = ["date", "outlet", "product", "units_sent", "units_sold", "units_wasted", "stockout",
            "price_kwd", "unit_cost_kwd", "holiday_flag", "promo_flag"]
    assert "true_demand" not in FEATURES and "true_demand" not in cols
    full[~full.missing][cols].to_csv("data.csv", index=False)

    summary = pd.DataFrame([
        ("Waste %", overall.waste_pct_before, overall.waste_pct_after),
        ("Stockout %", overall.stockout_pct_before, overall.stockout_pct_after),
        ("KWD lost to waste and stockouts", overall.kwd_lost_before, overall.kwd_lost_after),
        ("KWD saved vs baseline", np.nan, overall.kwd_saved),
        ("Gross margin (KWD)", overall.margin_kwd_before, overall.margin_kwd_after),
        ("Waste cost (KWD)", overall.waste_cost_kwd_before, overall.waste_cost_kwd_after),
        ("Lost margin on stockouts (KWD)", overall.lost_margin_kwd_before, overall.lost_margin_kwd_after),
        ("MAE (units)", *r["mae"]), ("WAPE %", *r["wape"])],
        columns=["metric", "baseline", "model"]).round(2)

    # Spread of the headline results over all seeds, to show how much one 6-week test can mislead.
    robust = pd.DataFrame(
        [(name, np.mean(v), np.min(v), np.max(v), N_RUNS) for name, v in [
            ("Waste cut %", [x["waste_cut"] for x in runs]),
            ("Stockout change (pts)", [x["stockout_change"] for x in runs]),
            ("KWD saved", [x["kwd_saved"] for x in runs])]],
        columns=["measure", "mean", "min", "max", "runs"]).round(2)

    plan = M[M.d >= D].sort_values(["d", "o", "p"])
    day = (plan.d - D).to_numpy()
    send = r["plan_send"][day, plan.o.to_numpy(), plan.p.to_numpy()]
    stock = r["plan_stock"][day, plan.o.to_numpy(), plan.p.to_numpy()]
    plan = pd.DataFrame({
        "date": w["dates"][plan.d].strftime("%Y-%m-%d"), "outlet": plan.outlet.astype(str).to_numpy(),
        "product": plan["product"].astype(str).to_numpy(), "forecast": plan.point.round(1).to_numpy(),
        "stock_on_hand": np.rint(stock).astype(int),  # stock assumed at the start of that day (packaged items)
        "recommended_send_units": send})

    with pd.ExcelWriter("output.xlsx", engine="openpyxl") as xl:
        summary.to_excel(xl, sheet_name="Summary", index=False)
        robust.to_excel(xl, sheet_name="Summary", startcol=5, index=False)  # side table, columns F:J
        ws = xl.sheets["Summary"]
        ws.column_dimensions["A"].width = 36
        ws.column_dimensions["F"].width = 24
        for i, note in enumerate(NOTES):
            ws.cell(row=len(summary) + 3 + i, column=1, value=note)
        plan.to_excel(xl, sheet_name="Next Week Send Plan", index=False)
        table.to_excel(xl, sheet_name="Before vs After", index=False)

    tf = pd.DataFrame({"date": w["dates"][test.d].strftime("%Y-%m-%d"), "outlet": test.outlet.astype(str).to_numpy(),
                       "product": test["product"].astype(str).to_numpy(), "forecast": test.point.round(2).to_numpy(),
                       "forecast_low": test.low.round(2).to_numpy(), "forecast_high": test.high.round(2).to_numpy(),
                       "actual": test.sold.astype(int).to_numpy()})
    tf.to_csv("test_forecast.csv", index=False)

    print("Seed 0 (all charts and tables)")
    print(summary.to_string(index=False))
    print(f"Waste reduction: {r['waste_cut']:.1f}%")
    print(table.to_string(index=False))
    print(f"\nRobustness over {N_RUNS} seeds")
    print(robust.drop(columns="runs").to_string(index=False))
    mean_cut = robust.loc[robust.measure == "Waste cut %", "mean"].iloc[0]
    if mean_cut > 40:
        print(f"WARNING: mean waste cut {mean_cut}% is above 40% and looks unrealistic. Not reporting it as a result.")


if __name__ == "__main__":
    main()
