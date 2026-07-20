import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, BarChart, Bar,
} from "recharts";
import { Inbox } from "lucide-react";

const COLORS = ["#059669", "#10b981", "#34d399", "#6ee7b7", "#f59e0b", "#3b82f6", "#a855f7", "#ec4899"];

const currency = (v) => `$${Number(v).toFixed(2)}`;

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
      {title && (
        <h3 className="mb-2 text-sm font-semibold text-emerald-900/80">{title}</h3>
      )}
      {children}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-emerald-100 bg-white/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      {label && <div className="mb-1 text-xs font-medium text-emerald-900/60">{label}</div>}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: entry.color || entry.fill }}
          />
          <span className="text-emerald-900/70">{entry.name}</span>
          <span className="font-semibold text-emerald-900">{currency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export function CategoryPieChart({ data }) {
  const chartData = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  if (!chartData.length) return <EmptyState label="No expenses yet" />;

  return (
    <ChartCard title="Spending by Category">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            innerRadius={60}
            outerRadius={95}
            paddingAngle={2}
            cornerRadius={4}
            label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} stroke="#fff" strokeWidth={2} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconType="circle"
            wrapperStyle={{ fontSize: 12, color: "#065f46" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function MonthlyTrendChart({ data }) {
  if (!data || !data.length) return <EmptyState label="No monthly trend yet" />;

  return (
    <ChartCard title="Income vs Expenses">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
          <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#065f46" }} axisLine={{ stroke: "#d1fae5" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#065f46" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12, color: "#065f46" }} />
          <Area
            type="monotone"
            dataKey="income"
            stroke="#10b981"
            strokeWidth={2.5}
            fill="url(#incomeGradient)"
            activeDot={{ r: 5 }}
          />
          <Area
            type="monotone"
            dataKey="expenses"
            stroke="#ef4444"
            strokeWidth={2.5}
            fill="url(#expenseGradient)"
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

export function TopCategoriesBarChart({ data }) {
  if (!data || !data.length) return <EmptyState label="No categories yet" />;

  return (
    <ChartCard title="Top Categories">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#059669" />
              <stop offset="100%" stopColor="#34d399" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" vertical={false} />
          <XAxis dataKey="category" tick={{ fontSize: 12, fill: "#065f46" }} axisLine={{ stroke: "#d1fae5" }} tickLine={false} />
          <YAxis tick={{ fontSize: 12, fill: "#065f46" }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#ecfdf5" }} />
          <Bar dataKey="amount" fill="url(#barGradient)" radius={[6, 6, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function EmptyState({ label }) {
  return (
    <div className="flex h-[280px] flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-emerald-200 bg-emerald-50/40 text-emerald-700/50">
      <Inbox size={28} strokeWidth={1.5} />
      <span className="text-sm">{label}</span>
    </div>
  );
}