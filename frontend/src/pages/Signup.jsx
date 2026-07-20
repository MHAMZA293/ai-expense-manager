import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Signup() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function update(field) {
    return (e) => setForm({ ...form, [field]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/signup", form);
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Signup failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left panel — illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#EEF2F6] relative overflow-hidden items-center">
        <svg
          className="absolute top-10 left-14 opacity-40"
          width="26"
          height="30"
          viewBox="0 0 26 30"
        >
          <polygon
            points="13,0 26,7.5 26,22.5 13,30 0,22.5 0,7.5"
            fill="none"
            stroke="#0F9D6E"
            strokeWidth="1.5"
          />
        </svg>
        <svg
          className="absolute bottom-24 left-1/3 opacity-30"
          width="18"
          height="21"
          viewBox="0 0 26 30"
        >
          <polygon
            points="13,0 26,7.5 26,22.5 13,30 0,22.5 0,7.5"
            fill="none"
            stroke="#0F9D6E"
            strokeWidth="1.5"
          />
        </svg>

        <div className="px-16 w-full">
          <h1 className="text-3xl font-bold text-[#111827] leading-snug mb-10 max-w-sm">
            Start Tracking
            <br />
            Every Rupee Today
          </h1>

          <div className="relative w-full max-w-md mx-auto">
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              <ellipse cx="200" cy="270" rx="150" ry="18" fill="#DCE3EA" />

              {/* piggy bank */}
              <ellipse cx="200" cy="190" rx="90" ry="60" fill="#0B1120" />
              <circle cx="270" cy="150" r="16" fill="#0B1120" />
              <rect x="185" y="120" width="30" height="14" rx="6" fill="#0F9D6E" />
              <circle cx="170" cy="195" r="6" fill="#EEF2F6" />
              <polygon points="120,180 100,165 100,195" fill="#0B1120" />
              <rect x="150" y="245" width="16" height="20" rx="4" fill="#0B1120" />
              <rect x="230" y="245" width="16" height="20" rx="4" fill="#0B1120" />

              {/* rising bars */}
              <rect x="46" y="200" width="24" height="50" rx="4" fill="#9AD8C4" />
              <rect x="330" y="170" width="24" height="80" rx="4" fill="#0F9D6E" />
              <rect x="360" y="210" width="24" height="40" rx="4" fill="#FDBA8C" />

              {/* coin drop */}
              <circle cx="200" cy="70" r="24" fill="#F5A25D" />
              <text x="200" y="78" textAnchor="middle" fontSize="20" fontWeight="700" fill="#7A3F14">
                $
              </text>
              <line x1="200" y1="94" x2="200" y2="118" stroke="#F5A25D" strokeWidth="2" strokeDasharray="4 4" />
            </svg>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="w-full lg:w-1/2 flex flex-col px-8 sm:px-16 lg:px-20 py-10">
        <div className="flex items-center gap-2 mb-16">
          <svg width="26" height="26" viewBox="0 0 26 26">
            <polygon
              points="13,0 26,7.5 26,22.5 13,30 0,22.5 0,7.5"
              fill="none"
              stroke="#0F9D6E"
              strokeWidth="2"
            />
            <circle cx="13" cy="13" r="4" fill="#0F9D6E" />
          </svg>
          <span className="text-lg font-bold text-[#111827]">
            Expense<span className="text-[#0F9D6E]">Manager</span>
          </span>
        </div>

        <div className="w-full max-w-sm mx-auto lg:mx-0">
          <h2 className="text-2xl font-bold text-[#0F9D6E] mb-6">Sign Up</h2>

          <form onSubmit={handleSubmit}>
            <p className="text-sm font-semibold text-[#111827] mb-1">
              Create your account
            </p>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              Start tracking and predicting your spending with AI.
            </p>

            {error && (
              <div className="mb-5 text-sm text-[#B42318] bg-[#FEF3F2] border border-[#FDA29B] rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Name
            </label>
            <input
              value={form.name}
              onChange={update("name")}
              placeholder="Full Name"
              className="w-full border border-[#E2E4E9] rounded-md px-3 py-2.5 mb-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E] focus:border-transparent transition"
              required
            />

            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="Email Address"
              className="w-full border border-[#E2E4E9] rounded-md px-3 py-2.5 mb-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E] focus:border-transparent transition"
              required
            />

            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={form.password}
              onChange={update("password")}
              placeholder="At least 6 characters"
              className="w-full border border-[#E2E4E9] rounded-md px-3 py-2.5 mb-6 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E] focus:border-transparent transition"
              required
              minLength={6}
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F9D6E] hover:bg-[#0C8059] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-3 font-semibold text-sm tracking-wide transition"
            >
              {loading ? "CREATING ACCOUNT…" : "SIGN UP"}
            </button>

            <p className="text-sm text-[#6B7280] mt-5 text-center">
              Already have an account?{" "}
              <Link to="/login" className="text-[#0F9D6E] font-medium">
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}