import React, { useState, useRef } from "react";
import api from "../api.js";

const CATEGORIES = ["Food", "Transport", "Shopping", "Bills", "Entertainment",
  "Health", "Education", "Rent", "Groceries", "Travel", "Other"];

export default function ExpenseForm({ onCreated }) {
  const [form, setForm] = useState({ description: "", amount: "", type: "expense", category: "", date: "" });
  const [suggestion, setSuggestion] = useState(null);
  const [scanning, setScanning] = useState(false);
  const debounceRef = useRef(null);

  function update(field) {
    return (e) => {
      const value = e.target.value;
      setForm((f) => ({ ...f, [field]: value }));
      if (field === "description") debouncedSuggest(value);
    };
  }

  function debouncedSuggest(text) {
    clearTimeout(debounceRef.current);
    if (!text.trim()) { setSuggestion(null); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await api.post("/expenses/categorize-preview", null, { params: { description: text } });
        setSuggestion(data.suggestions?.[0] || null);
      } catch {
        setSuggestion(null);
      }
    }, 400);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post("/expenses", {
      description: form.description,
      amount: parseFloat(form.amount),
      type: form.type,
      category: form.category || null, // AI predicts it server-side if left blank
      date: form.date || null,
    });
    setForm({ description: "", amount: "", type: "expense", category: "", date: "" });
    setSuggestion(null);
    onCreated();
  }

  async function handleReceiptUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setScanning(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { data } = await api.post("/expenses/receipt-scan", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({
        ...f,
        description: data.store_name || f.description,
        amount: data.amount ?? f.amount,
        category: data.suggested_category || f.category,
        date: data.date || f.date,
      }));
      if (data.error) alert(`OCR note: ${data.error}`);
    } finally {
      setScanning(false);
      e.target.value = "";
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-5 space-y-3">
      <h2 className="font-semibold">Add Transaction</h2>

      <div className="grid grid-cols-2 gap-3">
        <select value={form.type} onChange={update("type")} className="border rounded-md px-3 py-2 col-span-2">
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>

        <input
          placeholder="Description (e.g. McDonald's - $15)"
          value={form.description} onChange={update("description")}
          className="border rounded-md px-3 py-2 col-span-2" required
        />

        <input
          type="number" step="0.01" placeholder="Amount"
          value={form.amount} onChange={update("amount")}
          className="border rounded-md px-3 py-2" required
        />
        <input type="date" value={form.date} onChange={update("date")} className="border rounded-md px-3 py-2" />

        <select value={form.category} onChange={update("category")} className="border rounded-md px-3 py-2 col-span-2">
          <option value="">
            {suggestion ? `AI suggests: ${suggestion.category} (auto if left blank)` : "Auto-categorize with AI"}
          </option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between pt-1">
        <label className="text-sm text-brand-600 cursor-pointer">
          {scanning ? "Scanning receipt…" : "📷 Scan a receipt"}
          <input type="file" accept="image/*" className="hidden" onChange={handleReceiptUpload} disabled={scanning} />
        </label>
        <button type="submit" className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium">
          Add
        </button>
      </div>
    </form>
  );
}
