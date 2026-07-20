import React, { useState } from "react";
import api from "../api.js";

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export default function Reports() {
  const [month, setMonth] = useState(currentMonth());
  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  async function loadRecommendations() {
    setLoading(true);
    try {
      const { data } = await api.get("/recommendations", { params: { month } });
      setRec(data);
    } finally {
      setLoading(false);
    }
  }

  async function downloadPdf() {
    setDownloading(true);
    try {
      const res = await api.get(`/reports/monthly/${month}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `expense_report_${month}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-white rounded-xl shadow-sm p-5">
        <h2 className="font-semibold mb-3">Monthly Report</h2>
        <div className="flex items-center gap-3">
          <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} className="border rounded-md px-3 py-2" />
          <button onClick={loadRecommendations} className="bg-brand-600 hover:bg-brand-700 text-white rounded-md px-4 py-2 text-sm font-medium">
            {loading ? "Loading…" : "Get AI Insights"}
          </button>
          <button onClick={downloadPdf} disabled={downloading} className="border border-brand-600 text-brand-700 rounded-md px-4 py-2 text-sm font-medium">
            {downloading ? "Preparing…" : "Download PDF"}
          </button>
        </div>
      </div>

      {rec && (
        <div className="bg-white rounded-xl shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-xs text-gray-500">Income</p>
              <p className="text-lg font-bold text-green-600">${rec.income_total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Expenses</p>
              <p className="text-lg font-bold text-red-600">${rec.expense_total.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Savings</p>
              <p className="text-lg font-bold text-brand-700">${rec.savings.toFixed(2)}</p>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-2">By Category</h3>
            <ul className="text-sm divide-y">
              {Object.entries(rec.by_category).map(([cat, amt]) => (
                <li key={cat} className="flex justify-between py-1.5">
                  <span>{cat}</span><span>${amt.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-2">💡 AI Recommendations</h3>
            <ul className="space-y-1.5">
              {rec.tips.map((tip, i) => (
                <li key={i} className="text-sm bg-amber-50 text-amber-800 rounded-md px-3 py-2">{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
