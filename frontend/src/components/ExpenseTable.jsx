import React from "react";

export default function ExpenseTable({ expenses, onDelete }) {
  if (!expenses.length) {
    return <p className="text-gray-400 text-sm p-5">No transactions match your filters yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-500 border-b">
            <th className="py-2 px-3">Date</th>
            <th className="py-2 px-3">Description</th>
            <th className="py-2 px-3">Category</th>
            <th className="py-2 px-3">Type</th>
            <th className="py-2 px-3 text-right">Amount</th>
            <th className="py-2 px-3"></th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((e) => (
            <tr key={e.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="py-2 px-3">{e.date}</td>
              <td className="py-2 px-3">{e.description}</td>
              <td className="py-2 px-3">
                <span className="bg-brand-50 text-brand-700 text-xs px-2 py-1 rounded-full">{e.category}</span>
              </td>
              <td className="py-2 px-3 capitalize">{e.type}</td>
              <td className={`py-2 px-3 text-right font-medium ${e.type === "income" ? "text-green-600" : "text-red-600"}`}>
                {e.type === "income" ? "+" : "-"}${e.amount.toFixed(2)}
              </td>
              <td className="py-2 px-3 text-right">
                <button onClick={() => onDelete(e.id)} className="text-gray-400 hover:text-red-600">✕</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
