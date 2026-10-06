"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Goal {
  id: string;
  type: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  deadline?: string | null;
  notes?: string | null;
  achieved: boolean;
  createdAt: string;
}

const GOAL_TYPES = [
  { value: "weight_loss", label: "Weight Loss", icon: "⚖️", unit: "kg", placeholder: "Target weight (kg)" },
  { value: "weight_gain", label: "Weight Gain", icon: "📈", unit: "kg", placeholder: "Target weight (kg)" },
  { value: "workout_frequency", label: "Workout Frequency", icon: "🏋️", unit: "sessions/week", placeholder: "Sessions per week" },
  { value: "calorie_target", label: "Daily Calories", icon: "🔥", unit: "kcal", placeholder: "Daily calorie target" },
  { value: "protein_target", label: "Daily Protein", icon: "💪", unit: "g", placeholder: "Daily protein (g)" },
  { value: "water_intake", label: "Water Intake", icon: "💧", unit: "L/day", placeholder: "Daily water (L)" },
  { value: "run_distance", label: "Run Distance", icon: "🏃", unit: "km", placeholder: "Target distance (km)" },
  { value: "streak", label: "Workout Streak", icon: "🔥", unit: "days", placeholder: "Streak target (days)" },
  { value: "custom", label: "Custom Goal", icon: "🎯", unit: "units", placeholder: "Target value" },
];

const GOAL_COLORS: Record<string, string> = {
  weight_loss: "emerald",
  weight_gain: "blue",
  workout_frequency: "purple",
  calorie_target: "orange",
  protein_target: "sky",
  water_intake: "cyan",
  run_distance: "pink",
  streak: "yellow",
  custom: "indigo",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState({
    type: "workout_frequency",
    targetValue: "",
    currentValue: "",
    notes: "",
    deadline: "",
  });

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const json = await res.json();
      if (json.success) setGoals(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const saveGoal = async () => {
    if (!form.targetValue) {
      showToast("Please enter a target value", "error");
      return;
    }
    setSaving(true);
    try {
      const selectedType = GOAL_TYPES.find((g) => g.value === form.type);
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: form.type,
          targetValue: parseFloat(form.targetValue),
          currentValue: parseFloat(form.currentValue) || 0,
          unit: selectedType?.unit || "units",
          notes: form.notes || null,
          deadline: form.deadline || null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Goal created! 🎯");
        setForm({ type: "workout_frequency", targetValue: "", currentValue: "", notes: "", deadline: "" });
        setShowForm(false);
        fetchGoals();
      } else {
        showToast(json.error || "Failed to create goal", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateGoal = async (id: string, currentValue: number) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, currentValue }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Progress updated!");
        fetchGoals();
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        showToast("Goal removed");
        setGoals((prev) => prev.filter((g) => g.id !== id));
      }
    } catch {
      showToast("Failed to delete", "error");
    }
  };

  const activeGoals = goals.filter((g) => !g.achieved);
  const achievedGoals = goals.filter((g) => g.achieved);
  const selectedTypeInfo = GOAL_TYPES.find((g) => g.value === form.type);

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Goals & Streaks</h1>
          <p className="text-gray-400 mt-1">Set targets, track progress, achieve greatness</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-white font-medium rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
        >
          + New Goal
        </button>
      </div>

      {/* Create Goal Form */}
      {showForm && (
        <GlassCard className="p-6 border border-emerald-500/30">
          <h3 className="text-lg font-semibold text-white mb-4">Create New Goal</h3>
          <div className="space-y-4">
            {/* Goal Type Grid */}
            <div>
              <label className="text-sm text-gray-400 block mb-2">Goal Type</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {GOAL_TYPES.map((gt) => (
                  <button
                    key={gt.value}
                    onClick={() => setForm((p) => ({ ...p, type: gt.value }))}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm border transition-all ${
                      form.type === gt.value
                        ? "border-emerald-500 bg-emerald-500/10 text-white"
                        : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <span>{gt.icon}</span>
                    <span>{gt.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Target Value ({selectedTypeInfo?.unit})</label>
                <input
                  type="number"
                  placeholder={selectedTypeInfo?.placeholder}
                  value={form.targetValue}
                  onChange={(e) => setForm((p) => ({ ...p, targetValue: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Current Value ({selectedTypeInfo?.unit})</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.currentValue}
                  onChange={(e) => setForm((p) => ({ ...p, currentValue: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Deadline (optional)</label>
                <input
                  type="date"
                  value={form.deadline}
                  onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-sm text-gray-400 block mb-1">Notes (optional)</label>
                <input
                  type="text"
                  placeholder="Any notes..."
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={saveGoal}
                disabled={saving}
                className="px-6 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-white font-medium rounded-lg transition-all"
              >
                {saving ? "Creating..." : "Create Goal"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-2 bg-white/5 hover:bg-white/10 text-gray-300 font-medium rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </GlassCard>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Active Goals */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-3">Active Goals ({activeGoals.length})</h2>
            {activeGoals.length === 0 ? (
              <GlassCard className="p-8 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-gray-400">No active goals yet. Set your first goal to stay motivated!</p>
              </GlassCard>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeGoals.map((goal) => {
                  const typeInfo = GOAL_TYPES.find((g) => g.value === goal.type);
                  const pct = Math.min(100, (goal.currentValue / goal.targetValue) * 100);
                  const color = GOAL_COLORS[goal.type] || "emerald";
                  const daysLeft = goal.deadline
                    ? Math.ceil((new Date(goal.deadline).getTime() - Date.now()) / 86400000)
                    : null;

                  return (
                    <GlassCard key={goal.id} className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{typeInfo?.icon || "🎯"}</span>
                          <div>
                            <h4 className="font-semibold text-white">{typeInfo?.label || goal.type}</h4>
                            {goal.notes && <p className="text-xs text-gray-500">{goal.notes}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {daysLeft !== null && (
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              daysLeft < 7 ? "bg-red-500/20 text-red-400" :
                                daysLeft < 30 ? "bg-yellow-500/20 text-yellow-400" :
                                  "bg-white/5 text-gray-500"
                            }`}>
                              {daysLeft < 0 ? "Overdue" : `${daysLeft}d left`}
                            </span>
                          )}
                          <button
                            onClick={() => deleteGoal(goal.id)}
                            className="text-gray-600 hover:text-red-400 transition-colors ml-1 text-lg leading-none"
                          >
                            ×
                          </button>
                        </div>
                      </div>

                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-400">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                          <span className={`text-${color}-400 font-semibold`}>{Math.round(pct)}%</span>
                        </div>
                        <ProgressBar value={pct} max={100} label="" color={color as any} showValues={false} />
                      </div>

                      {/* Quick Update */}
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder={`Update progress (${goal.unit})`}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                          id={`goal-update-${goal.id}`}
                        />
                        <button
                          onClick={() => {
                            const input = document.getElementById(`goal-update-${goal.id}`) as HTMLInputElement;
                            const val = parseFloat(input.value);
                            if (!isNaN(val)) {
                              updateGoal(goal.id, val);
                              input.value = "";
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 text-xs rounded-lg transition-all"
                        >
                          Update
                        </button>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* Achieved Goals */}
          {achievedGoals.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-3">🏆 Achieved ({achievedGoals.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {achievedGoals.map((goal) => {
                  const typeInfo = GOAL_TYPES.find((g) => g.value === goal.type);
                  return (
                    <GlassCard key={goal.id} className="p-5 border border-emerald-500/30 bg-emerald-500/5">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{typeInfo?.icon || "🎯"}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-white">{typeInfo?.label || goal.type}</h4>
                          <p className="text-sm text-emerald-400">✓ {goal.targetValue} {goal.unit} achieved!</p>
                        </div>
                        <span className="text-2xl">🏆</span>
                      </div>
                    </GlassCard>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
