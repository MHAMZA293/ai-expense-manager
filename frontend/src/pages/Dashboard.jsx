import React, { useEffect, useState } from "react";
import api from "../api.js";
import { CategoryPieChart, MonthlyTrendChart, TopCategoriesBarChart } from "../components/Charts.jsx";

const STAT_STYLES = {
  income: { bg: "#ECFDF5", fg: "#0F9D6E", icon: "↑" },
  expense: { bg: "#FEF3F2", fg: "#DC2626", icon: "↓" },
  savings: { bg: "#EFF6FF", fg: "#2563EB", icon: "◆" },
  forecast: { bg: "#FFFBEB", fg: "#D97706", icon: "◎" },
};

function StatCard({ label, value, tone }) {
  const s = STAT_STYLES[tone];
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 flex items-start justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-[#9CA3AF] mb-2">
          {label}
        </p>
        <p className="text-2xl font-bold font-mono text-[#111827]">{value}</p>
      </div>
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold shrink-0"
        style={{ backgroundColor: s.bg, color: s.fg }}
      >
        {s.icon}
      </div>
    </div>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] p-5">
      <h2 className="font-semibold text-[#111827] text-sm">{title}</h2>
      {subtitle && <p className="text-xs text-[#9CA3AF] mt-0.5 mb-3">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-24" />
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-64" />
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-5 h-64" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/dashboard"), api.get("/forecast")])
      .then(([dashRes, forecastRes]) => {
        setSummary(dashRes.data);
        setForecast(forecastRes.data);
      })
      .catch(() => setErrored(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (errored || !summary) {
    return (
      <div className="bg-white rounded-xl border border-[#FDA29B] p-8 text-center">
        <p className="text-[#B42318] font-medium mb-1">Couldn't load your dashboard.</p>
        <p className="text-sm text-[#9CA3AF]">Check your connection and try refreshing the page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#111827]">Overview</h1>
        <p className="text-sm text-[#6B7280]">Where your money's been, and where it's headed.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Income" value={`$${summary.total_income.toFixed(2)}`} tone="income" />
        <StatCard label="Total Expenses" value={`$${summary.total_expenses.toFixed(2)}`} tone="expense" />
        <StatCard label="Savings" value={`$${summary.savings.toFixed(2)}`} tone="savings" />
        <StatCard
          label="Predicted Next Month"
          value={forecast ? `$${forecast.overall.toFixed(2)}` : "—"}
          tone="forecast"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Expenses by Category">
          <CategoryPieChart data={summary.by_category} />
        </Panel>
        <Panel title="Income vs Expenses" subtitle="Monthly">
          <MonthlyTrendChart data={summary.monthly_trend} />
        </Panel>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Panel title="Top Spending Categories">
          <TopCategoriesBarChart data={summary.top_categories} />
        </Panel>

        <Panel title="Predicted Spending" subtitle="Next month, by category">
          {forecast && Object.keys(forecast.by_category).length ? (
            <ul className="divide-y divide-[#F3F4F6]">
              {Object.entries(forecast.by_category).map(([cat, amt]) => (
                <li key={cat} className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-[#374151]">{cat}</span>
                  <span className="font-mono font-medium text-[#111827]">
                    ${amt.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-[#9CA3AF]">
                Add a few months of expenses to see predictions here.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}