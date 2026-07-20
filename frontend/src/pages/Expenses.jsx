import React, { useEffect, useState, useCallback, useMemo } from "react";
import api from "../api.js";
import ExpenseForm from "../components/ExpenseForm.jsx";
import ExpenseTable from "../components/ExpenseTable.jsx";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment",
  "Health", "Education", "Rent", "Groceries", "Travel", "Other"];

const EMPTY_FILTERS = { search: "", category: "", start_date: "", end_date: "" };

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    api.get("/expenses", { params })
      .then((res) => setExpenses(res.data))
      .finally(() => setLoading(false));
  }, [filters]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(id) {
    if (!confirm("Delete this transaction?")) return;
    await api.delete(`/expenses/${id}`);
    load();
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const total = useMemo(
    () => expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [expenses]
  );

  return (
    <div className="min-h-screen bg-emerald-50/40 -m-6 p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-emerald-950">Expenses</h1>
        <p className="text-sm text-emerald-700/70 mt-0.5">Track, filter, and manage your transactions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            <ExpenseForm onCreated={load} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Summary strip */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm shadow-emerald-900/5">
              <p className="text-xs font-medium text-emerald-700/70 uppercase tracking-wide">Showing</p>
              <p className="text-2xl font-semibold text-emerald-950 mt-1">
                {expenses.length} <span className="text-sm font-normal text-emerald-700/60">transactions</span>
              </p>
            </div>
            <div className="bg-emerald-600 rounded-2xl p-4 shadow-sm shadow-emerald-900/10">
              <p className="text-xs font-medium text-emerald-100 uppercase tracking-wide">Total</p>
              <p className="text-2xl font-semibold text-white mt-1">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-emerald-950">Filters</span>
              {activeFilterCount > 0 && (
                <button
                  onClick={() => setFilters(EMPTY_FILTERS)}
                  className="text-xs font-medium text-emerald-600 hover:text-emerald-800 transition-colors"
                >
                  Clear all ({activeFilterCount})
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3 items-end">
              <div className="flex-1 min-w-[160px]">
                <label className="block text-xs text-emerald-700/70 mb-1">Search</label>
                <div className="relative">
                  <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-400"
                    fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.3-4.3" strokeLinecap="round" />
                  </svg>
                  <input
                    value={filters.search}
                    onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                    placeholder="Search description…"
                    className="w-full border border-emerald-200 rounded-lg pl-8 pr-3 py-1.5 text-sm text-emerald-950 placeholder:text-emerald-400
                               focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-emerald-700/70 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
                  className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-950
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition"
                >
                  <option value="">All</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-emerald-700/70 mb-1">From</label>
                <input type="date" value={filters.start_date}
                  onChange={(e) => setFilters((f) => ({ ...f, start_date: e.target.value }))}
                  className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-950
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition" />
              </div>

              <div>
                <label className="block text-xs text-emerald-700/70 mb-1">To</label>
                <input type="date" value={filters.end_date}
                  onChange={(e) => setFilters((f) => ({ ...f, end_date: e.target.value }))}
                  className="border border-emerald-200 rounded-lg px-3 py-1.5 text-sm text-emerald-950
                             focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-400 transition" />
              </div>
            </div>
          </div>

          {/* Table / states */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm shadow-emerald-900/5 overflow-hidden">
            {loading ? (
              <div className="p-5 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-10 rounded-lg bg-emerald-100/60 animate-pulse" />
                ))}
              </div>
            ) : expenses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 px-6 text-center">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-6 4h6m2 5H7a2 2 0 01-2-2V4a2 2 0 012-2h7l5 5v12a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-emerald-950">No transactions found</p>
                <p className="text-xs text-emerald-700/60 mt-1">
                  {activeFilterCount > 0 ? "Try adjusting or clearing your filters." : "Add your first expense to get started."}
                </p>
              </div>
            ) : (
              <ExpenseTable expenses={expenses} onDelete={handleDelete} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}