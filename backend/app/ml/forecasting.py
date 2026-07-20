"""
Spending Prediction
--------------------
Forecasts next month's spending, overall and per category, from the
user's historical monthly totals.

Default implementation: a dependency-light linear-trend + moving-average
blend using numpy only, so the project runs with zero extra native
dependencies (Prophet/LSTM both pull in heavy libraries that are
overkill for a small personal dataset and awkward to install on some
platforms).

Swap-in options (see README):
  - Prophet (`pip install prophet`) — better for data with strong
    seasonality once you have 12+ months of history.
  - LSTM (PyTorch/TensorFlow) — worth it once you have a lot of users /
    a lot of history; needs far more data than a single user typically has.
  - statsmodels ARIMA — classic alternative to Prophet.

Swap by re-implementing `forecast_series()` below with the same signature.
"""
from __future__ import annotations

from collections import defaultdict
from datetime import date
from typing import Dict, List, Tuple

import numpy as np


def _monthly_totals(rows: List[Tuple[date, str, float]]) -> Dict[str, float]:
    """rows: list of (date, category, amount) -> {'2026-05': total, ...}"""
    totals: Dict[str, float] = defaultdict(float)
    for d, _cat, amount in rows:
        key = f"{d.year:04d}-{d.month:02d}"
        totals[key] += amount
    return dict(sorted(totals.items()))


def forecast_series(monthly_values: List[float]) -> float:
    """
    Predicts the next value in a monthly time series.
    Blends a simple linear regression trend with a recent moving average,
    which is robust on the short (3-12 point) series typical for a single
    user's expense history.
    """
    if not monthly_values:
        return 0.0
    if len(monthly_values) == 1:
        return round(monthly_values[0], 2)

    y = np.array(monthly_values, dtype=float)
    x = np.arange(len(y))

    # Linear trend
    slope, intercept = np.polyfit(x, y, 1)
    trend_pred = slope * len(y) + intercept

    # Recent moving average (last up to 3 months)
    recent = y[-3:]
    ma_pred = recent.mean()

    # Blend: trust the trend a bit more once we have more history
    trend_weight = min(0.6, 0.15 * len(y))
    prediction = trend_weight * trend_pred + (1 - trend_weight) * ma_pred

    return round(max(prediction, 0.0), 2)


def forecast_overall_and_by_category(
    rows: List[Tuple[date, str, float]]
) -> Dict:
    """
    rows: (date, category, amount) for a user's expense-type transactions.
    Returns: {
      "overall": 1234.5,
      "by_category": {"Food": 230.0, "Transport": 90.0, ...},
      "history": {"2026-05": 800, "2026-06": 900, ...}
    }
    """
    overall_series = _monthly_totals(rows)
    overall_values = list(overall_series.values())
    overall_forecast = forecast_series(overall_values)

    by_cat_rows: Dict[str, List[Tuple[date, str, float]]] = defaultdict(list)
    for d, cat, amount in rows:
        by_cat_rows[cat or "Other"].append((d, cat, amount))

    by_category_forecast = {}
    for cat, cat_rows in by_cat_rows.items():
        series = list(_monthly_totals(cat_rows).values())
        by_category_forecast[cat] = forecast_series(series)

    return {
        "overall": overall_forecast,
        "by_category": by_category_forecast,
        "history": overall_series,
    }
