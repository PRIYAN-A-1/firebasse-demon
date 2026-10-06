"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";

interface RecoveryEntry {
  id: string;
  date: string;
  sleepHours: number;
  sleepQuality: number;
  muscleSoreness: number;
  stressLevel: number;
  energyLevel: number;
  recoveryScore: number;
  notes?: string | null;
}

const RECOVERY_TIPS: Record<number, { title: string; tips: string[]; color: string }> = {
  5: {
    title: "Exceptional Recovery 🌟",
    color: "emerald",
    tips: [
      "Your body is primed for a high-intensity session today",
      "Great time for PRs — push your limits!",
      "Your sleep and stress levels are optimal",
    ],
  },
  4: {
    title: "Good Recovery 💪",
    color: "blue",
    tips: [
      "You're ready for a solid workout session",
      "Moderate to high intensity is appropriate",
      "Focus on hydration to maintain this momentum",
    ],
  },
  3: {
    title: "Moderate Recovery ⚡",
    color: "yellow",
    tips: [
      "Consider a moderate-intensity session today",
      "Extra stretching or yoga would be beneficial",
      "Prioritize sleep tonight for better recovery",
    ],
  },
  2: {
    title: "Low Recovery ⚠️",
    color: "orange",
    tips: [
      "A light walk or gentle yoga is recommended",
      "Avoid heavy lifting — focus on mobility",
      "Prioritize sleep and stress management",
    ],
  },
  1: {
    title: "Rest Day Recommended 🛌",
    color: "red",
    tips: [
      "Your body needs rest — listen to it",
      "Focus on sleep, hydration, and nutrition",
      "Light stretching is fine, skip intense exercise",
    ],
  },
};

function getRecoveryLevel(score: number): number {
  if (score >= 85) return 5;
  if (score >= 70) return 4;
  if (score >= 50) return 3;
  if (score >= 30) return 2;
  return 1;
}

export default function RecoveryPage() {
  const [entries, setEntries] = useState<RecoveryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [todayEntry, setTodayEntry] = useState<RecoveryEntry | null>(null);
  const [form, setForm] = useState({
    sleepHours: 7,
    sleepQuality: 3,
    muscleSoreness: 3,
    stressLevel: 3,
    energyLevel: 3,
    notes: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchRecovery = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recovery");
      const json = await res.json();
      if (json.success) {
        setEntries(json.data);
        const today = new Date().toDateString();
        const existing = json.data.find(
          (e: RecoveryEntry) => new Date(e.date).toDateString() === today
        );
        if (existing) setTodayEntry(existing);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecovery();
  }, [fetchRecovery]);

  // Compute live recovery score from form
  const computeScore = () => {
    const sleepScore = (form.sleepHours / 9) * 100 * 0.3;
    const qualityScore = (form.sleepQuality / 5) * 100 * 0.2;
    const sorenessScore = ((5 - form.muscleSoreness + 1) / 5) * 100 * 0.2;
    const stressScore = ((5 - form.stressLevel + 1) / 5) * 100 * 0.15;
    const energyScore = (form.energyLevel / 5) * 100 * 0.15;
    return Math.min(100, Math.round(sleepScore + qualityScore + sorenessScore + stressScore + energyScore));
  };

  const liveScore = computeScore();
  const liveLevel = getRecoveryLevel(liveScore);
  const recoveryInfo = RECOVERY_TIPS[liveLevel];

  const saveRecovery = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/recovery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Recovery logged! 🌙");
        setTodayEntry(json.data);
        fetchRecovery();
      } else {
        showToast(json.error || "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const SLIDER_CONFIG = [
    { key: "sleepHours", label: "Sleep Duration", min: 0, max: 12, step: 0.5, unit: "hrs", icon: "😴", reverseColor: false },
    { key: "sleepQuality", label: "Sleep Quality", min: 1, max: 5, step: 1, unit: "/5", icon: "💤", reverseColor: false },
    { key: "muscleSoreness", label: "Muscle Soreness", min: 1, max: 5, step: 1, unit: "/5", icon: "💪", reverseColor: true },
    { key: "stressLevel", label: "Stress Level", min: 1, max: 5, step: 1, unit: "/5", icon: "🧠", reverseColor: true },
    { key: "energyLevel", label: "Energy Level", min: 1, max: 5, step: 1, unit: "/5", icon: "⚡", reverseColor: false },
  ] as const;

  const avgScore = entries.length > 0
    ? Math.round(entries.slice(0, 7).reduce((sum, e) => sum + e.recoveryScore, 0) / Math.min(7, entries.length))
    : 0;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Recovery Tracking</h1>
        <p className="text-gray-400 mt-1">Monitor sleep, stress, and recovery to optimize performance</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Log Form */}
          <div className="lg:col-span-2 space-y-6">
            {todayEntry ? (
              <GlassCard className="p-6 border border-emerald-500/30">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-2xl">✅</div>
                  <div>
                    <h3 className="font-semibold text-white">Today&apos;s Recovery Logged</h3>
                    <p className="text-sm text-gray-400">Score: <span className="text-emerald-400 font-bold">{todayEntry.recoveryScore}/100</span></p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{todayEntry.sleepHours}h</div>
                    <div className="text-xs text-gray-500">Sleep</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{todayEntry.energyLevel}/5</div>
                    <div className="text-xs text-gray-500">Energy</div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <div className="text-xl font-bold text-white">{todayEntry.stressLevel}/5</div>
                    <div className="text-xs text-gray-500">Stress</div>
                  </div>
                </div>
                {todayEntry.notes && (
                  <p className="text-sm text-gray-400 mt-3 italic">&ldquo;{todayEntry.notes}&rdquo;</p>
                )}
              </GlassCard>
            ) : (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-1">Log Today&apos;s Recovery</h3>
                <p className="text-sm text-gray-400 mb-6">How are you feeling right now?</p>

                <div className="space-y-6">
                  {SLIDER_CONFIG.map((config) => {
                    const value = form[config.key];
                    const pct = ((value - config.min) / (config.max - config.min)) * 100;
                    return (
                      <div key={config.key}>
                        <div className="flex justify-between items-center mb-2">
                          <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <span>{config.icon}</span> {config.label}
                          </label>
                          <span className="text-sm font-bold text-white bg-white/10 px-3 py-0.5 rounded-full">
                            {value}{config.unit}
                          </span>
                        </div>
                        <div className="relative h-2 rounded-full bg-white/10">
                          <div
                            className={`absolute left-0 top-0 h-full rounded-full transition-all ${
                              config.reverseColor
                                ? pct > 60 ? "bg-red-500" : pct > 40 ? "bg-yellow-500" : "bg-emerald-500"
                                : pct > 60 ? "bg-emerald-500" : pct > 40 ? "bg-yellow-500" : "bg-red-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                          <input
                            type="range"
                            min={config.min}
                            max={config.max}
                            step={config.step}
                            value={value}
                            onChange={(e) => setForm((p) => ({ ...p, [config.key]: parseFloat(e.target.value) }))}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                        </div>
                        {config.key !== "sleepHours" && (
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>{config.reverseColor ? "Best" : "Poor"}</span>
                            <span>{config.reverseColor ? "Worst" : "Great"}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
                    <textarea
                      value={form.notes}
                      onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                      placeholder="How are you feeling? Any aches, mood notes..."
                      rows={2}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={saveRecovery}
                    disabled={saving}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                  >
                    {saving ? "Saving..." : "Log Recovery 🌙"}
                  </button>
                </div>
              </GlassCard>
            )}

            {/* History */}
            {entries.length > 0 && (
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent History</h3>
                <div className="space-y-3">
                  {entries.slice(0, 7).map((entry) => {
                    const level = getRecoveryLevel(entry.recoveryScore);
                    const colors = ["", "red", "orange", "yellow", "blue", "emerald"];
                    const color = colors[level];
                    return (
                      <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/5">
                        <div className={`w-10 h-10 rounded-full bg-${color}-500/20 flex items-center justify-center text-sm font-bold text-${color}-400 shrink-0`}>
                          {entry.recoveryScore}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-white">
                              {new Date(entry.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                            </span>
                          </div>
                          <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                            <span>😴 {entry.sleepHours}h</span>
                            <span>⚡ {entry.energyLevel}/5</span>
                            <span>💪 Soreness {entry.muscleSoreness}/5</span>
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full bg-${color}-500/10 text-${color}-400 shrink-0`}>
                          {RECOVERY_TIPS[level]?.title.split(" ")[0]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Live Score */}
            <GlassCard className="p-6 text-center">
              <h3 className="text-sm font-medium text-gray-400 mb-4">Recovery Preview</h3>
              <div className="relative w-28 h-28 mx-auto mb-4">
                <svg viewBox="0 0 120 120" className="-rotate-90 w-full h-full">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={liveScore >= 70 ? "#10b981" : liveScore >= 50 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - liveScore / 100)}`}
                    className="transition-all duration-300"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{liveScore}</span>
                  <span className="text-xs text-gray-500">/100</span>
                </div>
              </div>
              <h4 className={`font-semibold text-${recoveryInfo.color}-400 mb-3`}>{recoveryInfo.title}</h4>
              <div className="space-y-2">
                {recoveryInfo.tips.map((tip, i) => (
                  <p key={i} className="text-xs text-gray-400 text-left bg-white/5 rounded-lg p-2">
                    • {tip}
                  </p>
                ))}
              </div>
            </GlassCard>

            {/* Weekly Average */}
            {entries.length > 0 && (
              <GlassCard className="p-5">
                <h3 className="text-sm font-medium text-gray-400 mb-3">7-Day Average</h3>
                <div className="text-3xl font-bold text-white mb-1">{avgScore}<span className="text-sm text-gray-500">/100</span></div>
                <div className="flex gap-1 mt-3">
                  {entries.slice(0, 7).reverse().map((entry, i) => {
                    const h = (entry.recoveryScore / 100) * 40;
                    const col = entry.recoveryScore >= 70 ? "bg-emerald-500" : entry.recoveryScore >= 50 ? "bg-yellow-500" : "bg-red-500";
                    return (
                      <div key={i} className="flex-1 flex flex-col justify-end" title={`${entry.recoveryScore}`}>
                        <div className={`${col} rounded-sm opacity-80`} style={{ height: `${Math.max(h, 4)}px` }} />
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>7 days ago</span>
                  <span>Today</span>
                </div>
              </GlassCard>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
