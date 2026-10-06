"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface WeeklyReview {
  weekStart: string;
  weekEnd: string;
  workouts: {
    total: number;
    totalDuration: number;
    totalCaloriesBurned: number;
    sessions: Array<{ date: string; type: string; duration: number }>;
  };
  nutrition: {
    avgCalories: number;
    avgProtein: number;
    avgCarbs: number;
    avgFat: number;
    loggedDays: number;
    totalMeals: number;
  };
  recovery: {
    avgScore: number;
    avgSleep: number;
    avgEnergy: number;
    entries: number;
  };
  weight: {
    start: number | null;
    end: number | null;
    change: number;
  };
  water: {
    avgLiters: number;
    loggedDays: number;
  };
  aiSummary: string;
  score: number;
}

export default function WeeklyReviewPage() {
  const [review, setReview] = useState<WeeklyReview | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReview = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/weekly-review");
      const json = await res.json();
      if (json.success) setReview(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReview();
  }, [fetchReview]);

  const score = review?.score ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Weekly Review</h1>
        <p className="text-gray-400 mt-1">Your fitness summary for the past 7 days</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : review ? (
        <>
          {/* Overall Score Banner */}
          <GlassCard className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-purple-500/10 pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row items-center gap-6">
              <div className="relative shrink-0">
                <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle
                    cx="60" cy="60" r="50" fill="none"
                    stroke={score >= 80 ? "#10b981" : score >= 60 ? "#3b82f6" : score >= 40 ? "#f59e0b" : "#ef4444"}
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 50}`}
                    strokeDashoffset={`${2 * Math.PI * 50 * (1 - score / 100)}`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{score}</span>
                  <span className="text-xs text-gray-500">/100</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {score >= 80 ? "🔥 Outstanding Week!" :
                    score >= 60 ? "💪 Solid Progress!" :
                      score >= 40 ? "📈 Building Momentum" :
                        "🌱 Keep Going!"}
                </h2>
                <p className="text-sm text-gray-400 mb-2">
                  {new Date(review.weekStart).toLocaleDateString("en-US", { month: "long", day: "numeric" })} —{" "}
                  {new Date(review.weekEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-sm text-emerald-400">
                    🏋️ {review.workouts.total} Workouts
                  </span>
                  <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-sm text-blue-400">
                    🥗 {review.nutrition.loggedDays} Nutrition Days
                  </span>
                  <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 rounded-full text-sm text-purple-400">
                    😴 {review.recovery.avgSleep.toFixed(1)}h Avg Sleep
                  </span>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* AI Summary */}
          {review.aiSummary && (
            <GlassCard className="p-6 border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-white/10 flex items-center justify-center text-xl shrink-0">
                  🤖
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-purple-300 mb-2">AI Coach Summary</h3>
                  <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{review.aiSummary}</p>
                </div>
              </div>
            </GlassCard>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Workouts */}
            <GlassCard className="p-5">
              <div className="text-2xl mb-2">🏋️</div>
              <div className="text-3xl font-bold text-white">{review.workouts.total}</div>
              <div className="text-sm text-gray-400">Workouts</div>
              <div className="mt-2 text-xs text-gray-600">{review.workouts.totalDuration} min total</div>
              <ProgressBar value={review.workouts.total} max={7} label="" color="emerald" showValues={false} />
            </GlassCard>

            {/* Nutrition */}
            <GlassCard className="p-5">
              <div className="text-2xl mb-2">🥗</div>
              <div className="text-3xl font-bold text-white">{Math.round(review.nutrition.avgCalories)}</div>
              <div className="text-sm text-gray-400">Avg Calories/day</div>
              <div className="mt-2 text-xs text-gray-600">{Math.round(review.nutrition.avgProtein)}g protein avg</div>
              <ProgressBar value={review.nutrition.loggedDays} max={7} label="" color="blue" showValues={false} />
            </GlassCard>

            {/* Recovery */}
            <GlassCard className="p-5">
              <div className="text-2xl mb-2">😴</div>
              <div className="text-3xl font-bold text-white">{review.recovery.avgScore}</div>
              <div className="text-sm text-gray-400">Avg Recovery Score</div>
              <div className="mt-2 text-xs text-gray-600">{review.recovery.avgSleep.toFixed(1)}h avg sleep</div>
              <ProgressBar value={review.recovery.avgScore} max={100} label="" color="purple" showValues={false} />
            </GlassCard>

            {/* Weight */}
            <GlassCard className="p-5">
              <div className="text-2xl mb-2">⚖️</div>
              <div className="text-3xl font-bold text-white">
                {review.weight.change !== 0 ? `${review.weight.change > 0 ? "+" : ""}${review.weight.change.toFixed(1)}` : "—"}
              </div>
              <div className="text-sm text-gray-400">Weight Change</div>
              <div className="mt-2 text-xs text-gray-600">
                {review.weight.end ? `Current: ${review.weight.end.toFixed(1)} kg` : "Not logged"}
              </div>
            </GlassCard>
          </div>

          {/* Detailed Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Workout Breakdown */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Workout Breakdown</h3>
              {review.workouts.sessions.length === 0 ? (
                <p className="text-gray-500 text-sm">No workouts logged this week</p>
              ) : (
                <div className="space-y-2">
                  {review.workouts.sessions.map((session, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <span className="text-lg">🏋️</span>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-white capitalize">{session.type.replace("_", " ")}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(session.date).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{session.duration} min</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Nutrition Macros */}
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Nutrition Averages</h3>
              <div className="space-y-3">
                {[
                  { label: "Calories", value: Math.round(review.nutrition.avgCalories), unit: "kcal/day", color: "orange", max: 2500 },
                  { label: "Protein", value: Math.round(review.nutrition.avgProtein), unit: "g/day", color: "blue", max: 200 },
                  { label: "Carbs", value: Math.round(review.nutrition.avgCarbs), unit: "g/day", color: "yellow", max: 300 },
                  { label: "Fat", value: Math.round(review.nutrition.avgFat), unit: "g/day", color: "red", max: 100 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-medium">{item.value} {item.unit}</span>
                    </div>
                    <ProgressBar
                      value={item.value}
                      max={item.max}
                      label=""
                      color={item.color as "emerald" | "blue" | "orange" | "purple" | "red"}
                      showValues={false}
                    />
                  </div>
                ))}
              </div>

              {review.nutrition.loggedDays < 7 && (
                <p className="mt-4 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
                  ⚠️ Only {review.nutrition.loggedDays}/7 days logged this week. Track every day for better insights!
                </p>
              )}
            </GlassCard>
          </div>

          {/* Water Intake */}
          {review.water.loggedDays > 0 && (
            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">💧 Water Intake</h3>
              <div className="flex items-center gap-4">
                <div className="text-4xl font-bold text-cyan-400">{review.water.avgLiters.toFixed(1)}<span className="text-lg text-gray-400 ml-1">L/day avg</span></div>
                <div className="flex-1">
                  <ProgressBar value={review.water.avgLiters} max={3} label="" color="blue" showValues={false} />
                  <p className="text-xs text-gray-500 mt-1">Logged {review.water.loggedDays}/7 days</p>
                </div>
              </div>
            </GlassCard>
          )}
        </>
      ) : (
        <GlassCard className="p-12 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">No Data This Week</h3>
          <p className="text-gray-400">Start logging workouts, meals, and recovery to see your weekly review!</p>
          <div className="flex justify-center gap-3 mt-6">
            <a href="/workouts" className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-medium hover:bg-emerald-400 transition-all">Log Workout</a>
            <a href="/nutrition" className="px-4 py-2 bg-white/10 text-white rounded-lg text-sm font-medium hover:bg-white/20 transition-all">Log Meal</a>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
