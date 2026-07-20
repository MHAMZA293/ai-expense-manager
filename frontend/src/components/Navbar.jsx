import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Wallet } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const linkClass = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive
        ? "bg-emerald-600 text-white shadow-sm"
        : "text-emerald-900/70 hover:bg-emerald-50 hover:text-emerald-700"
    }`;

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <nav className="bg-white border-b border-emerald-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2 font-bold text-emerald-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-600 text-white">
              <Wallet size={16} strokeWidth={2.25} />
            </span>
            AI Expense Manager
          </span>
          <div className="flex gap-1">
            <NavLink to="/" className={linkClass} end>
              Dashboard
            </NavLink>
            <NavLink to="/expenses" className={linkClass}>
              Expenses
            </NavLink>
            <NavLink to="/reports" className={linkClass}>
              Reports
            </NavLink>
            <NavLink to="/assistant" className={linkClass}>
              AI Assistant
            </NavLink>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm">
          {user && (
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold">
                {initials}
              </span>
              <span className="text-emerald-900/80">Hi, {user.name}</span>
            </div>
          )}
          <button
            onClick={logout}
            className="px-3 py-1.5 rounded-md text-emerald-700/70 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
      <div className="text-center text-xs text-emerald-700/60 pb-1.5">
        Developed by HAMZA
      </div>
    </nav>
  );
}