from datetime import datetime, timedelta
from statistics import mean


class RetailPredictiveEngine:
    def __init__(self, rows: list[dict]):
        self.rows = rows

    def train_and_forecast_next_month(self) -> dict:
        grouped = {}
        for row in self.rows:
            date = row.get("order_date") or row.get("Order Date")
            revenue = float(row.get("revenue") or row.get("Revenue") or 0)
            if not date:
                continue
            grouped[date] = grouped.get(date, 0) + revenue

        daily = [{"date": date, "revenue": revenue} for date, revenue in sorted(grouped.items())]
        if not daily:
            return {"metrics": {"projected_monthly_revenue": 0, "peak_day_forecast": 0}, "timeline_series": []}

        recent = daily[-14:]
        baseline = mean(day["revenue"] for day in recent)
        trend = (recent[-1]["revenue"] - recent[0]["revenue"]) / max(len(recent), 1)
        last_date = datetime.fromisoformat(daily[-1]["date"]).date()
        weekly_weights = [0.94, 0.98, 1.02, 1.05, 1.13, 1.2, 1.08]

        timeline = []
        for index in range(1, 91):
            date = last_date + timedelta(days=index)
            predicted = max(0, (baseline + trend * index) * weekly_weights[date.weekday()])
            timeline.append({"date": date.isoformat(), "predicted_revenue": round(predicted, 2)})

        return {
            "metrics": {
                "projected_monthly_revenue": round(sum(day["predicted_revenue"] for day in timeline), 2),
                "peak_day_forecast": round(max(day["predicted_revenue"] for day in timeline), 2),
            },
            "timeline_series": timeline,
        }
