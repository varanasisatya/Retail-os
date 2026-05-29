import csv
import os
from collections import defaultdict
from datetime import datetime, timedelta
from io import StringIO
from statistics import mean

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="RetailOS AI Analytics API", version="1.0.0")

# ─── CORS Configuration ────────────────────────────────────────────────────────
# Reads allowed origins from the ALLOWED_ORIGINS environment variable so the
# server is deployable to any environment (Vercel, Railway, AWS) without
# code changes. Falls back to localhost defaults for local development.
#
# Usage:
#   Production:  ALLOWED_ORIGINS=https://retailos.vercel.app,https://app.retailos.ai
#   Staging:     ALLOWED_ORIGINS=https://retailos-staging.vercel.app
#   Local:       (not set — falls back to localhost defaults)
_raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
ALLOWED_ORIGINS = [origin.strip() for origin in _raw_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _read_value(row: dict, *keys: str, default=None):
    normalized = {key.strip().lower(): value for key, value in row.items()}
    for key in keys:
        value = normalized.get(key.lower())
        if value not in (None, ""):
            return value
    return default


def _to_float(value, default=0.0) -> float:
    try:
        return float(str(value).replace("$", "").replace("₹", "").replace(",", "").strip())
    except (TypeError, ValueError):
        return default


def _to_date(value: str) -> str | None:
    if not value:
        return None

    for fmt in ("%Y-%m-%d", "%m/%d/%Y", "%d/%m/%Y", "%d-%m-%Y", "%m-%d-%Y"):
        try:
            return datetime.strptime(value.strip(), fmt).date().isoformat()
        except ValueError:
            continue
    return None


def _normalize_rows(raw_bytes: bytes) -> list[dict]:
    text = raw_bytes.decode("utf-8-sig", errors="replace")
    reader = csv.DictReader(StringIO(text))
    rows = []

    for row in reader:
        order_date = _to_date(_read_value(row, "Order Date", "Date", "orderDate"))
        revenue = _to_float(_read_value(row, "Revenue", "Sales", "Amount", default=0))

        if not order_date or revenue <= 0:
            continue

        rows.append(
            {
                "order_date": order_date,
                "category": _read_value(row, "Category", "Product Category", default="General"),
                "region": _read_value(row, "Region", "Channel", default="All stores"),
                "product": _read_value(row, "Product", "SKU", default="Assorted retail"),
                "revenue": revenue,
                "quantity_sold": _to_float(
                    _read_value(row, "Quantity Sold", "Quantity", "Units", default=0)
                ),
                "margin": _to_float(_read_value(row, "Margin", "Gross Margin", default=0.32), 0.32),
            }
        )

    return rows


def _group_sum(rows: list[dict], key: str) -> list[dict]:
    grouped = defaultdict(lambda: {"revenue": 0.0, "quantity_sold": 0.0, "margin_revenue": 0.0})

    for row in rows:
        bucket = grouped[row[key]]
        bucket["revenue"] += row["revenue"]
        bucket["quantity_sold"] += row["quantity_sold"]
        bucket["margin_revenue"] += row["revenue"] * row["margin"]

    return [
        {
            "name": name,
            "revenue": round(values["revenue"], 2),
            "quantity_sold": round(values["quantity_sold"], 2),
            "margin_revenue": round(values["margin_revenue"], 2),
        }
        for name, values in sorted(grouped.items(), key=lambda item: item[1]["revenue"], reverse=True)
    ]


def _daily_series(rows: list[dict]) -> list[dict]:
    grouped = defaultdict(lambda: {"revenue": 0.0, "quantity_sold": 0.0})

    for row in rows:
        grouped[row["order_date"]]["revenue"] += row["revenue"]
        grouped[row["order_date"]]["quantity_sold"] += row["quantity_sold"]

    return [
        {
            "date": date,
            "revenue": round(values["revenue"], 2),
            "quantity_sold": round(values["quantity_sold"], 2),
        }
        for date, values in sorted(grouped.items())
    ]


def _forecast(daily: list[dict], periods: int = 30) -> list[dict]:
    if not daily:
        return []

    recent = daily[-14:]
    baseline = mean(day["revenue"] for day in recent)
    first = recent[0]["revenue"]
    last = recent[-1]["revenue"]
    trend = (last - first) / max(len(recent), 1)
    last_date = datetime.fromisoformat(daily[-1]["date"]).date()
    weekly_weights = [0.94, 0.98, 1.02, 1.05, 1.13, 1.2, 1.08]
    forecast = []

    for index in range(1, periods + 1):
        date = last_date + timedelta(days=index)
        predicted = max(0, (baseline + trend * index) * weekly_weights[date.weekday()])
        forecast.append(
            {
                "date": date.isoformat(),
                "predicted_revenue": round(predicted, 2),
                "lower_bound": round(predicted * 0.88, 2),
                "upper_bound": round(predicted * 1.12, 2),
            }
        )

    return forecast


def _compile_report(rows: list[dict]) -> dict:
    daily = _daily_series(rows)
    forecast = _forecast(daily)
    categories = _group_sum(rows, "category")
    regions = _group_sum(rows, "region")
    recent = daily[-14:]
    previous = daily[-28:-14]
    recent_revenue = sum(day["revenue"] for day in recent)
    previous_revenue = sum(day["revenue"] for day in previous)
    margin_revenue = sum(row["revenue"] * row["margin"] for row in rows[-200:])
    revenue_base = sum(row["revenue"] for row in rows[-200:]) or 1

    return {
        "metrics": {
            "current_revenue": round(recent_revenue, 2),
            "revenue_change_percent": round(
                ((recent_revenue - previous_revenue) / previous_revenue) * 100, 2
            )
            if previous_revenue
            else 0,
            "projected_monthly_revenue": round(sum(day["predicted_revenue"] for day in forecast), 2),
            "peak_day_forecast": round(max((day["predicted_revenue"] for day in forecast), default=0), 2),
            "gross_margin_percent": round((margin_revenue / revenue_base) * 100, 2),
            "top_category": categories[0]["name"] if categories else "General",
        },
        "daily_series": daily,
        "timeline_series": forecast,
        "category_breakdown": categories,
        "region_breakdown": regions,
        "recommendations": [
            {
                "title": "Protect high-velocity stock",
                "detail": f"{categories[0]['name']} is the top demand driver." if categories else "Demand is balanced.",
                "priority": "high",
            },
            {
                "title": "Rebalance regional allocation",
                "detail": f"{regions[0]['name']} is leading sales velocity." if regions else "No region signal found.",
                "priority": "medium",
            },
            {
                "title": "Tune campaign calendar",
                "detail": "Forecast peaks should drive replenishment and promotion timing.",
                "priority": "medium",
            },
        ],
    }


@app.get("/health")
async def health():
    return {"status": "ok", "service": "retailos-ai-api", "allowed_origins": ALLOWED_ORIGINS}


@app.post("/api/v1/analytics/async-compute")
async def calculate_enterprise_intelligence(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="CSV files are required.")

    raw_bytes = await file.read()
    rows = _normalize_rows(raw_bytes)

    if not rows:
        raise HTTPException(
            status_code=422,
            detail=(
                "No usable retail rows found. "
                "Verify your CSV includes these columns: Date (or 'Order Date'), "
                "Revenue (or 'Sales' / 'Amount'), and optionally Category, Region, Quantity Sold."
            ),
        )

    return {
        "status": "success",
        "execution_context": "retailos_lightweight_forecast_engine",
        "payload": _compile_report(rows),
    }
