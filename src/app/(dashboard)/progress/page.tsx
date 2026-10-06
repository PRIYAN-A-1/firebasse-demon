"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface ProgressData {
  workouts: {
    total: number;
    thisWeek: number;
    thisMonth: number;
    avgDuration: number;
    streak: number;
  };
  nutrition: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    loggedDays: number;
  };
  weight: {
    current: number | null;
    start: number | null;
    change: number;
    entries: Array<{ date: string; weight: number }>;
  };
  bodyMeasurements: Array<{
    date: string;
    chest?: number | null;
    waist?: number | null;
    hips?: number | null;
    biceps?: number | null;
    thighs?: number | null;
  }>;
  fitnessScore: number;
  weeklyData: Array<{
    week: string;
    workouts: number;
    calories: number;
    avgProtein: number;
  }>;
}

const PERIOD_OPTIONS = [
  { label: "7 Days", value: "7" },
  { label: "30 Days", value: "30" },
  { label: "90 Days", value: "90" },
  { label: "All Time", value: "365" },
];

export default function ProgressPage() {
  const [data, setData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("30");
  const [activeTab, setActiveTab] = useState<"overview" | "body" | "strength" | "nutrition">("overview");
  const [newMeasurement, setNewMeasurement] = useState({
    chest: "",
    waist: "",
    hips: "",
    biceps: "",
    thighs: "",
  });
  const [showMeasForm, setShowMeasForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProgress = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/progress?days=${period}`);
      const json = await res.json();
      if (json.success) setData(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const saveMeasurement = async () => {
    const payload: Record<string, number> = {};
    Object.entries(newMeasurement).forEach(([k, v]) => {
      if (v) payload[k] = parseFloat(v);
    });
    if (Object.keys(payload).length === 0) return;
    setSaving(true);
    try {
      const res = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "body_measurement", ...payload }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Measurements saved!");
        setNewMeasurement({ chest: "", waist: "", hips: "", biceps: "", thighs: "" });
        setShowMeasForm(false);
        fetchProgress();
      } else {
        showToast(json.error || "Failed to save", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const weightChange = data?.weight.change ?? 0;
  const latestMeas = data?.bodyMeasurements[0];

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-2xl transition-all ${
          toast.type === "success" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Progress Analytics</h1>
          <p className="text-gray-400 mt-1">Track your fitness journey over time</p>
        </div>
        <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                period === opt.value
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/25"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : data ? (
        <>
          {/* Fitness Score */}
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="relative">
                <svg className="w-32 h-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke="url(#scoreGrad)"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - data.fitnessScore / 100)}`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                  <span className="text-3xl font-bold text-white">{data.fitnessScore}</span>
                  <span className="text-xs text-gray-400">/ 100</span>
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold text-white mb-1">Fitness Score</h2>
                <p className="text-gray-400 text-sm mb-4">
                  {data.fitnessScore >= 80 ? "Excellent! You're crushing it 🔥" :
                    data.fitnessScore >= 60 ? "Good progress! Keep pushing 💪" :
                      data.fitnessScore >= 40 ? "Building momentum — stay consistent 📈" :
                        "Just getting started — every step counts 🚀"}
                </p>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-emerald-400">{data.workouts.streak}</div>
                    <div className="text-xs text-gray-500">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-400">{data.workouts.thisWeek}</div>
                    <div className="text-xs text-gray-500">This Week</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-400">{data.workouts.total}</div>
                    <div className="text-xs text-gray-500">Total Workouts</div>
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Tabs */}
          <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
            {(["overview", "body", "strength", "nutrition"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                  activeTab === tab
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  title="Workouts"
                  value={data.workouts.thisMonth}
                  unit="this month"
                  icon="🏋️"
                  trend={data.workouts.thisMonth > 8 ? { value: "up", isPositive: true } : { value: "neutral", isNeutral: true }}
                  color="emerald"
                />
                <MetricCard
                  title="Avg Duration"
                  value={data.workouts.avgDuration}
                  unit="min"
                  icon="⏱️"
                  color="cyan"
                />
                <MetricCard
                  title="Weight Change"
                  value={Math.abs(weightChange).toFixed(1)}
                  unit={`kg ${weightChange <= 0 ? "lost" : "gained"}`}
                  icon="⚖️"
                  trend={weightChange < 0 ? { value: "down", isPositive: true } : weightChange > 0 ? { value: "up", isPositive: false } : { value: "neutral", isNeutral: true }}
                  color={weightChange <= 0 ? "emerald" : "amber"}
                />
                <MetricCard
                  title="Logged Days"
                  value={data.nutrition.loggedDays}
                  unit="nutrition days"
                  icon="🥗"
                  color="neutral"
                />
              </div>

              {/* Weekly Workout Chart */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Weekly Activity</h3>
                {data.weeklyData.length === 0 ? (
                  <p className="text-gray-500 text-sm text-center py-8">No data yet — start logging workouts!</p>
                ) : (
                  <div className="space-y-3">
                    {data.weeklyData.slice(-8).map((week, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-xs text-gray-500 w-20 shrink-0">{week.week}</span>
                        <div className="flex-1">
                          <ProgressBar
                            value={week.workouts}
                            max={7}
                            label=""
                            color="emerald"
                            showValues={false}
                          />
                        </div>
                        <span className="text-xs text-emerald-400 w-16 text-right">{week.workouts} sessions</span>
                      </div>
                    ))}
                  </div>
                )}
              </GlassCard>

              {/* Nutrition Overview */}
              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Average Daily Nutrition</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    { label: "Calories", value: Math.round(data.nutrition.avgCalories), unit: "kcal", color: "orange" },
                    { label: "Protein", value: Math.round(data.nutrition.avgProtein), unit: "g", color: "blue" },
                    { label: "Carbs", value: Math.round(data.nutrition.avgCarbs), unit: "g", color: "yellow" },
                    { label: "Fat", value: Math.round(data.nutrition.avgFat), unit: "g", color: "red" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl p-4 bg-${item.color}-500/10 border border-${item.color}-500/20`}>
                      <div className="text-2xl font-bold text-white">{item.value}<span className="text-sm text-gray-400 ml-1">{item.unit}</span></div>
                      <div className="text-sm text-gray-400 mt-1">{item.label}</div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}

          {/* Body Tab */}
          {activeTab === "body" && (
            <div className="space-y-6">
              {/* Weight Trend */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Weight Trend</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Current:</span>
                    <span className="text-lg font-bold text-emerald-400">
                      {data.weight.current ? `${data.weight.current} kg` : "—"}
                    </span>
                  </div>
                </div>
                {data.weight.entries.length < 2 ? (
                  <p className="text-gray-500 text-sm text-center py-8">Log at least 2 weight entries to see your trend</p>
                ) : (
                  <div className="h-40 flex items-end gap-1">
                    {(() => {
                      const entries = data.weight.entries.slice(-20);
                      const min = Math.min(...entries.map(e => e.weight)) - 1;
                      const max = Math.max(...entries.map(e => e.weight)) + 1;
                      const range = max - min || 1;
                      return entries.map((entry, i) => {
                        const h = ((entry.weight - min) / range) * 100;
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                            <div className="relative">
                              <div
                                className="w-full min-w-[8px] rounded-t bg-gradient-to-t from-emerald-500 to-emerald-400 opacity-80 group-hover:opacity-100 transition-all"
                                style={{ height: `${Math.max(h, 5)}%` }}
                              />
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>{data.weight.entries[0]?.date ? new Date(data.weight.entries[0].date).toLocaleDateString() : ""}</span>
                  <span>{data.weight.entries[data.weight.entries.length - 1]?.date ? new Date(data.weight.entries[data.weight.entries.length - 1].date).toLocaleDateString() : ""}</span>
                </div>
              </GlassCard>

              {/* Body Measurements */}
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Body Measurements</h3>
                  <button
                    onClick={() => setShowMeasForm(!showMeasForm)}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-medium rounded-lg transition-all"
                  >
                    + Log
                  </button>
                </div>

                {showMeasForm && (
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                    <p className="text-sm text-gray-300 font-medium">New Measurements (cm)</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {(["chest", "waist", "hips", "biceps", "thighs"] as const).map((field) => (
                        <div key={field}>
                          <label className="text-xs text-gray-500 capitalize block mb-1">{field}</label>
                          <input
                            type="number"
                            placeholder="—"
                            value={newMeasurement[field]}
                            onChange={(e) => setNewMeasurement((p) => ({ ...p, [field]: e.target.value }))}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={saveMeasurement}
                        disabled={saving}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-all"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={() => setShowMeasForm(false)}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {latestMeas ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                      { label: "Chest", value: latestMeas.chest, icon: "💪" },
                      { label: "Waist", value: latestMeas.waist, icon: "📏" },
                      { label: "Hips", value: latestMeas.hips, icon: "🫁" },
                      { label: "Biceps", value: latestMeas.biceps, icon: "💪" },
                      { label: "Thighs", value: latestMeas.thighs, icon: "🦵" },
                    ].map((m) => (
                      <div key={m.label} className="rounded-xl p-4 bg-white/5 border border-white/10 text-center">
                        <div className="text-2xl mb-1">{m.icon}</div>
                        <div className="text-xl font-bold text-white">{m.value ? `${m.value}` : "—"}<span className="text-sm text-gray-400 ml-1">cm</span></div>
                        <div className="text-xs text-gray-500 mt-1">{m.label}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center py-8">No measurements logged yet. Click &quot;+ Log&quot; to start tracking!</p>
                )}
              </GlassCard>
            </div>
          )}

          {/* Strength Tab */}
          {activeTab === "strength" && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Strength Progress</h3>
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🏋️</div>
                <p className="text-gray-400 text-lg font-medium">Log workouts with sets & reps to track strength gains</p>
                <p className="text-gray-600 text-sm mt-2">Your personal records will appear here as you train</p>
                <a href="/workouts" className="inline-block mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg font-medium transition-all">
                  Go to Workouts
                </a>
              </div>
            </GlassCard>
          )}

          {/* Nutrition Tab */}
          {activeTab === "nutrition" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Avg Calories", value: Math.round(data.nutrition.avgCalories), unit: "kcal/day", color: "orange" },
                  { label: "Avg Protein", value: Math.round(data.nutrition.avgProtein), unit: "g/day", color: "blue" },
                  { label: "Avg Carbs", value: Math.round(data.nutrition.avgCarbs), unit: "g/day", color: "yellow" },
                  { label: "Avg Fat", value: Math.round(data.nutrition.avgFat), unit: "g/day", color: "red" },
                ].map((item) => (
                  <GlassCard key={item.label} className="p-5 text-center">
                    <div className="text-3xl font-bold text-white">{item.value}</div>
                    <div className="text-sm text-gray-400 mt-1">{item.unit}</div>
                    <div className="text-xs text-gray-600 mt-1">{item.label}</div>
                  </GlassCard>
                ))}
              </div>

              <GlassCard className="p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Nutrition Consistency</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <ProgressBar
                      value={data.nutrition.loggedDays}
                      max={parseInt(period)}
                      label={`Logged ${data.nutrition.loggedDays} of ${period} days`}
                      color="emerald"
                    />
                  </div>
                  <span className="text-2xl font-bold text-emerald-400">
                    {Math.round((data.nutrition.loggedDays / parseInt(period)) * 100)}%
                  </span>
                </div>
                <p className="text-gray-500 text-sm mt-3">
                  {data.nutrition.loggedDays >= parseInt(period) * 0.8
                    ? "🔥 Outstanding consistency! Keep it up."
                    : data.nutrition.loggedDays >= parseInt(period) * 0.5
                      ? "📈 Good effort — aim for daily logging."
                      : "💡 Try logging meals every day for best results."}
                </p>
              </GlassCard>
            </div>
          )}
        </>
      ) : (
        <GlassCard className="p-12 text-center">
          <p className="text-gray-500">No data available. Start logging workouts and meals to see your progress!</p>
        </GlassCard>
      )}
    </div>
  );
}

