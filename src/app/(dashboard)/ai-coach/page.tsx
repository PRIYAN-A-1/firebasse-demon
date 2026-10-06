"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

const SUGGESTION_PROMPTS = [
  "Create a 4-week beginner workout plan for me",
  "What should I eat post-workout for muscle recovery?",
  "How many calories should I eat to lose 5kg?",
  "What exercises target lower back pain?",
  "Give me a high-protein meal plan for today",
  "How do I improve my running stamina?",
  "What's the best way to break through a weight loss plateau?",
  "Design a home workout with no equipment",
];

function formatMessage(content: string) {
  // Simple markdown-like formatting
  const lines = content.split("\n");
  return lines.map((line, i) => {
    if (line.startsWith("## ")) return <h3 key={i} className="text-lg font-bold text-white mt-3 mb-1">{line.slice(3)}</h3>;
    if (line.startsWith("# ")) return <h2 key={i} className="text-xl font-bold text-white mt-3 mb-1">{line.slice(2)}</h2>;
    if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-bold text-white">{line.slice(2, -2)}</p>;
    if (line.startsWith("- ") || line.startsWith("• ")) return (
      <div key={i} className="flex items-start gap-2 my-0.5">
        <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
        <span>{line.slice(2)}</span>
      </div>
    );
    if (line.match(/^\d+\. /)) return (
      <div key={i} className="flex items-start gap-2 my-0.5">
        <span className="text-emerald-400 shrink-0 font-mono text-xs mt-0.5">{line.match(/^(\d+)\./)?.[1]}.</span>
        <span>{line.replace(/^\d+\. /, "")}</span>
      </div>
    );
    if (line === "") return <div key={i} className="h-2" />;
    return <p key={i} className="my-0.5 leading-relaxed">{line}</p>;
  });
}

export default function AICoachPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchHistory = useCallback(async () => {
    setFetching(true);
    try {
      const res = await fetch("/api/ai/coach");
      const json = await res.json();
      if (json.success) {
        setMessages(json.data.map((m: Message) => ({ ...m, createdAt: m.createdAt })));
      }
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: messageText }),
      });
      const json = await res.json();
      if (json.success) {
        const aiMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: json.data.response,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        showToast(json.error || "AI Coach unavailable", "error");
        setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
      }
    } catch {
      showToast("Network error. Please try again.", "error");
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = async () => {
    if (!confirm("Clear all conversation history?")) return;
    setMessages([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-purple-500 flex items-center justify-center text-xl">
            🤖
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Fitness Coach</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-gray-400">Online — ready to help</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-xs text-gray-500 hover:text-red-400 transition-colors px-3 py-1 rounded-lg hover:bg-red-500/10"
          >
            Clear Chat
          </button>
        )}
      </div>

      {/* Messages Area */}
      <GlassCard className="flex-1 overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {fetching ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-4xl mb-4">
                🤖
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Meet Your AI Fitness Coach</h2>
              <p className="text-gray-400 max-w-md text-sm leading-relaxed mb-8">
                I&apos;m your personalized AI fitness assistant. Ask me anything about workouts, nutrition, 
                recovery, meal plans, exercise form, or your fitness goals!
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTION_PROMPTS.slice(0, 4).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(prompt)}
                    className="text-left px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-emerald-500/30 text-sm text-gray-300 hover:text-white transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-base shrink-0 mt-1">
                      🤖
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-emerald-500 text-white rounded-tr-sm"
                        : "bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="space-y-0.5">{formatMessage(msg.content)}</div>
                    ) : (
                      msg.content
                    )}
                    <div className={`text-xs mt-1.5 ${msg.role === "user" ? "text-emerald-100/70" : "text-gray-600"}`}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  {msg.role === "user" && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-base shrink-0 mt-1">
                      👤
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center text-base shrink-0 mt-1">
                    🤖
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-sm px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Suggestion bar (only when chatting) */}
        {messages.length > 0 && !loading && (
          <div className="px-4 py-2 border-t border-white/5 flex gap-2 overflow-x-auto scrollbar-hide">
            {SUGGESTION_PROMPTS.slice(4).map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-gray-400 hover:text-white transition-all whitespace-nowrap"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 border-t border-white/10">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask your AI coach anything... (Enter to send, Shift+Enter for new line)"
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm resize-none focus:outline-none focus:border-emerald-500 placeholder:text-gray-600 max-h-32"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 128) + "px";
              }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || loading}
              className="w-12 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all shadow-lg shadow-emerald-500/25"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">
            AI responses are based on general fitness science. Consult a professional for medical advice.
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
