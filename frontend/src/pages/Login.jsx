import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api.js";

export default function Login() {
  const [email, setEmail] = useState("demo@example.com");
  const [password, setPassword] = useState("demo1234");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
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
            Set Your Expenses
            <br />
            on Auto-Pilot
          </h1>

          <div className="relative w-full max-w-md mx-auto">
            <svg viewBox="0 0 400 300" className="w-full h-auto">
              <ellipse cx="200" cy="270" rx="150" ry="18" fill="#DCE3EA" />

              <rect x="90" y="120" width="220" height="130" rx="16" fill="#0B1120" />
              <rect x="90" y="120" width="220" height="40" rx="16" fill="#111C2E" />
              <circle cx="270" cy="185" r="14" fill="#0F9D6E" />

              <rect x="60" y="190" width="26" height="60" rx="4" fill="#FDBA8C" />
              <rect x="314" y="160" width="26" height="90" rx="4" fill="#0F9D6E" />
              <rect x="346" y="200" width="26" height="50" rx="4" fill="#9AD8C4" />

              <circle cx="140" cy="90" r="26" fill="#F5A25D" />
              <text x="140" y="98" textAnchor="middle" fontSize="22" fontWeight="700" fill="#7A3F14">
                $
              </text>

              <g transform="translate(228 40) rotate(8)">
                <rect width="70" height="86" rx="6" fill="#FFFFFF" stroke="#DCE3EA" />
                <rect x="10" y="14" width="50" height="4" rx="2" fill="#DCE3EA" />
                <rect x="10" y="26" width="50" height="4" rx="2" fill="#DCE3EA" />
                <rect x="10" y="38" width="34" height="4" rx="2" fill="#DCE3EA" />
                <rect x="10" y="58" width="50" height="6" rx="2" fill="#0F9D6E" />
              </g>
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
          <h2 className="text-2xl font-bold text-[#0F9D6E] mb-6">Login</h2>

          <form onSubmit={handleSubmit}>
            <p className="text-sm font-semibold text-[#111827] mb-1">
              Login to your account
            </p>
            <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
              Welcome back — log in to see where your money went and what
              the AI recommends next.
            </p>

            {error && (
              <div className="mb-5 text-sm text-[#B42318] bg-[#FEF3F2] border border-[#FDA29B] rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email or Phone Number"
              className="w-full border border-[#E2E4E9] rounded-md px-3 py-2.5 mb-4 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E] focus:border-transparent transition"
              required
            />

            <label className="block text-xs font-medium text-[#6B7280] mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full border border-[#E2E4E9] rounded-md px-3 py-2.5 mb-3 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0F9D6E] focus:border-transparent transition"
              required
            />

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-[#374151] cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-[#D1D5DB] text-[#0F9D6E] focus:ring-[#0F9D6E]"
                />
                Remember me
              </label>
              <button
                type="button"
                className="text-sm text-[#0F9D6E] font-medium hover:underline"
              >
                Reset Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0F9D6E] hover:bg-[#0C8059] disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-md py-3 font-semibold text-sm tracking-wide transition"
            >
              {loading ? "SIGNING IN…" : "SIGN IN"}
            </button>

            <p className="text-sm text-[#6B7280] mt-5 text-center">
              Don't have an account yet?{" "}
              <Link to="/signup" className="text-[#0F9D6E] font-medium">
                Join Expense Manager Now!
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}