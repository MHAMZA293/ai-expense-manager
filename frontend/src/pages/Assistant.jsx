import React, { useState, useRef, useEffect } from "react";
import api from "../api.js";

const SUGGESTIONS = [
  "How much did I spend on food last month?",
  "Show my highest expense.",
  "Where can I save money?",
  "What's my total spending?",
];

function Avatar({ role }) {
  if (role === "user") {
    return (
      <div className="w-7 h-7 rounded-full bg-[#111827] text-white flex items-center justify-center text-xs font-semibold shrink-0">
        You
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-sm shrink-0">
      ✦
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex items-end gap-2">
      <Avatar role="assistant" />
      <div className="rounded-2xl rounded-bl-sm bg-[#F3F4F6] px-4 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF] animate-bounce"
            style={{ animationDelay: `${i * 120}ms` }}
          />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ role, text }) {
  const isUser = role === "user";
  return (
    <div className={`flex items-end gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar role={role} />
      <div
        className={`rounded-2xl px-4 py-2.5 text-sm max-w-[75%] leading-relaxed ${
          isUser
            ? "bg-[#111827] text-white rounded-br-sm"
            : "bg-[#F3F4F6] text-[#1F2937] rounded-bl-sm"
        }`}
      >
        {text}
      </div>
    </div>
  );
}

export default function Assistant() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi! Ask me anything about your expenses — try one of the suggestions below." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  async function send(question) {
    const q = question ?? input;
    if (!q.trim() || loading) return;
    setMessages((m) => [...m, { role: "user", text: q }]);
    setInput("");
    setLoading(true);
    try {
      const { data } = await api.post("/assistant/ask", { question: q });
      setMessages((m) => [...m, { role: "assistant", text: data.answer }]);
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't process that. Try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl border border-[#E5E7EB] flex flex-col h-[75vh] overflow-hidden">
      <div className="px-5 py-4 border-b border-[#E5E7EB] flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center text-base font-bold shrink-0">
          ✦
        </div>
        <div>
          <p className="font-semibold text-[#111827] text-sm">AI Financial Assistant</p>
          <p className="text-xs text-[#9CA3AF]">Ask about spending, trends, and budget tips</p>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.map((m, i) => (
          <MessageBubble key={i} role={m.role} text={m.text} />
        ))}
        {loading && <TypingBubble />}
      </div>

      <div className="px-5 py-3 border-t border-[#E5E7EB] space-y-3 bg-[#FAFAFA]">
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="text-xs bg-white border border-[#E5E7EB] text-[#374151] px-3 py-1.5 rounded-full hover:border-[#2563EB] hover:text-[#2563EB] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {s}
            </button>
          ))}
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send(); }} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your spending…"
            disabled={loading}
            className="flex-1 border border-[#E5E7EB] rounded-lg px-3.5 py-2.5 text-sm text-[#111827] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] disabled:bg-[#F3F4F6]"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-[#111827] hover:bg-[#1F2937] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed text-white rounded-lg px-4 py-2.5 text-sm font-medium transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}