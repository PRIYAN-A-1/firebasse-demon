"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard } from "@/components/ui/MetricCard";

interface WeightEntry {
  id: string;
  weight: number;
  bodyFat?: number | null;
  muscleMass?: number | null;
  notes?: string | null;
  createdAt: string;
}

interface WeightStats {
  current: number | null;
  start: number | null;
  min: number | null;
  max: number | null;
  change: number;
  entries: WeightEntry[];
}

export default function WeightPage() {
  const [stats, setStats] = useState<WeightStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    weight: "",
    bodyFat: "",
    muscleMass: "",
    notes: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchWeight = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weight");
      const json = await res.json();
      if (json.success) setStats(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeight();
  }, [fetchWeight]);

  const logWeight = async () => {
    if (!form.weight) {
      showToast("Please enter your weight", "error");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight: parseFloat(form.weight),
          bodyFat: form.bodyFat ? parseFloat(form.bodyFat) : undefined,
          muscleMass: form.muscleMass ? parseFloat(form.muscleMass) : undefined,
          notes: form.notes || undefined,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Weight logged! ⚖️");
        setForm({ weight: "", bodyFat: "", muscleMass: "", notes: "" });
        fetchWeight();
      } else {
        showToast(json.error || "Failed to log weight", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (id: string) => {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/weight?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Entry removed");
        fetchWeight();
      }
    } catch {
      showToast("Failed to delete", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const entries = stats?.entries || [];
  const chartEntries = entries.slice(-30);

  // Mini chart height calculation
  const chartMax = chartEntries.length > 0 ? Math.max(...chartEntries.map(e => e.weight)) + 2 : 100;
  const chartMin = chartEntries.length > 0 ? Math.min(...chartEntries.map(e => e.weight)) - 2 : 50;
  const chartRange = chartMax - chartMin || 1;

  const weightChange = stats?.change ?? 0;
  const isLoss = weightChange < 0;

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
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Weight Tracker</h1>
        <p className="text-gray-400 mt-1">Monitor your weight and body composition over time</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Log Form */}
          <div className="space-y-4">
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Log Weight</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Weight (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 72.5"
                    value={form.weight}
                    onChange={(e) => setForm((p) => ({ ...p, weight: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Body Fat % (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 18.5"
                    value={form.bodyFat}
                    onChange={(e) => setForm((p) => ({ ...p, bodyFat: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Muscle Mass kg (optional)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 55.0"
                    value={form.muscleMass}
                    onChange={(e) => setForm((p) => ({ ...p, muscleMass: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. after morning workout"
                    value={form.notes}
                    onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={logWeight}
                  disabled={saving}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
                >
                  {saving ? "Logging..." : "Log Weight ⚖️"}
                </button>
              </div>
            </GlassCard>

            {/* Stats Summary */}
            {stats && (
              <div className="grid grid-cols-2 gap-3">
                <MetricCard
                  title="Current"
                  value={stats.current?.toFixed(1) ?? "—"}
                  unit="kg"
                  icon="⚖️"
                  color="emerald"
                />
                <MetricCard
                  title="Change"
                  value={`${weightChange >= 0 ? "+" : ""}${weightChange.toFixed(1)}`}
                  unit="kg"
                  icon={isLoss ? "📉" : "📈"}
                  trend={isLoss ? "down" : "up"}
                  color={isLoss ? "emerald" : "orange"}
                />
                <MetricCard
                  title="Lowest"
                  value={stats.min?.toFixed(1) ?? "—"}
                  unit="kg"
                  icon="🎯"
                  color="blue"
                />
                <MetricCard
                  title="Highest"
                  value={stats.max?.toFixed(1) ?? "—"}
                  unit="kg"
                  icon="📊"
                  color="purple"
                />
              </div>
            )}
          </div>

          {/* Right: Chart + History */}
          <div className="lg:col-span-2 space-y-6">
            {/* Weight Chart */}
            <GlassCard className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Weight Trend</h3>
                <span className="text-sm text-gray-500">{chartEntries.length} entries</span>
              </div>

              {chartEntries.length < 2 ? (
                <div className="h-48 flex flex-col items-center justify-center text-gray-500">
                  <div className="text-4xl mb-3">📊</div>
                  <p className="text-sm">Log at least 2 entries to see your trend chart</p>
                </div>
              ) : (
                <div>
                  {/* SVG Line Chart */}
                  <div className="relative h-48">
                    <svg viewBox={`0 0 ${chartEntries.length * 20} 100`} className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Area fill */}
                      <path
                        d={`M0,${100 - ((chartEntries[0].weight - chartMin) / chartRange) * 90} ${
                          chartEntries.map((e, i) => `L${i * 20},${100 - ((e.weight - chartMin) / chartRange) * 90}`).join(" ")
                        } L${(chartEntries.length - 1) * 20},100 L0,100 Z`}
                        fill="url(#weightGrad)"
                      />
                      {/* Line */}
                      <polyline
                        points={chartEntries.map((e, i) => `${i * 20},${100 - ((e.weight - chartMin) / chartRange) * 90}`).join(" ")}
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      {/* Dots */}
                      {chartEntries.map((e, i) => (
                        <circle
                          key={i}
                          cx={i * 20}
                          cy={100 - ((e.weight - chartMin) / chartRange) * 90}
                          r="3"
                          fill="#10b981"
                          stroke="#090A0F"
                          strokeWidth="2"
                        >
                          <title>{e.weight} kg — {new Date(e.createdAt).toLocaleDateString()}</title>
                        </circle>
                      ))}
                    </svg>
                    {/* Y-axis labels */}
                    <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-600 pr-2 pointer-events-none">
                      <span>{chartMax.toFixed(1)}</span>
                      <span>{((chartMax + chartMin) / 2).toFixed(1)}</span>
                      <span>{chartMin.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-2">
                    <span>{new Date(chartEntries[0].createdAt).toLocaleDateString()}</span>
                    <span>{new Date(chartEntries[chartEntries.length - 1].createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              )}
            </GlassCard>

            {/* History Table */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">History</h3>
              {entries.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No weight entries yet. Log your first measurement!</p>
              ) : (
                <div className="space-y-2">
                  {entries.slice(0, 15).map((entry, idx) => {
                    const prevEntry = entries[idx + 1];
                    const delta = prevEntry ? entry.weight - prevEntry.weight : 0;
                    return (
                      <div key={entry.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                        <div className="w-24 shrink-0">
                          <div className="text-sm font-medium text-white">
                            {new Date(entry.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-white">{entry.weight}<span className="text-sm text-gray-400 font-normal"> kg</span></span>
                            {delta !== 0 && prevEntry && (
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                delta < 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                              }`}>
                                {delta > 0 ? "+" : ""}{delta.toFixed(1)} kg
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3 text-xs text-gray-600 mt-0.5">
                            {entry.bodyFat && <span>Body Fat: {entry.bodyFat}%</span>}
                            {entry.muscleMass && <span>Muscle: {entry.muscleMass} kg</span>}
                            {entry.notes && <span className="italic">{entry.notes}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEntry(entry.id)}
                          disabled={deletingId === entry.id}
                          className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-lg"
                        >
                          {deletingId === entry.id ? "..." : "×"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
}
