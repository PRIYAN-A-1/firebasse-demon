"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Flame,
  Zap,
  Droplets,
  Dumbbell,
  Play,
  HeartPulse,
  TrendingUp,
  Camera,
  Bot,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Plus,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { MetricCard, Skeleton } from "@/components/ui/MetricCard";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

export default function DashboardPage() {
  const { success: toastSuccess, error: toastError } = useToast();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Quick Water Modal state
  const [waterModalOpen, setWaterModalOpen] = useState(false);
  const [waterAmount, setWaterAmount] = useState(250);
  const [loggingWater, setLoggingWater] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogWater = async (amount: number) => {
    setLoggingWater(true);
    try {
      const res = await fetch("/api/water", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountMl: amount }),
      });
      if (res.ok) {
        toastSuccess("Hydration Logged", `Added ${amount} ml to today's hydration.`);
        setWaterModalOpen(false);
        fetchDashboardData();
      } else {
        toastError("Error", "Could not log water");
      }
    } catch (err) {
      toastError("Error", "Network error");
    } finally {
      setLoggingWater(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-80 rounded-2xl" />
        </div>
      </div>
    );
  }

  const {
    userName,
    today,
    targets,
    fitnessScore,
    recovery,
    weightTrend,
    streaks,
    chartData,
  } = data || {};

  const caloriesConsumed = today?.calories || 0;
  const calorieTarget = targets?.calorieTarget || 2200;
  const caloriesRemaining = Math.max(0, calorieTarget - caloriesConsumed);

  const proteinConsumed = today?.protein || 0;
  const proteinTarget = targets?.proteinTarget || 130;

  const waterConsumedL = Math.round(((today?.waterMl || 0) / 1000) * 10) / 10;
  const waterTargetL = Math.round(((targets?.waterTargetMl || 3000) / 1000) * 10) / 10;

  const currentDateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Greeting & Today's Focus */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            <span>{currentDateStr}</span>
            <span>•</span>
            <span className="text-emerald-400 font-bold">FITTRACK PRECISION DASHBOARD</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Good Morning, {userName || "Athlete"}
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Today&apos;s Focus: <strong className="text-neutral-200">Push Hypertrophy & High-Protein Meal Adherence</strong>
          </p>
        </div>

        {/* Quick Actions Bar */}
        <div className="flex items-center gap-2.5">
          <Link href="/nutrition/scan">
            <Button size="sm" variant="glass" icon={<Camera className="w-3.5 h-3.5 text-emerald-400" />}>
              Scan Food
            </Button>
          </Link>
          <Button
            size="sm"
            variant="glass"
            onClick={() => setWaterModalOpen(true)}
            icon={<Droplets className="w-3.5 h-3.5 text-cyan-400" />}
          >
            + Water
          </Button>
          <Link href="/workouts/active">
            <Button size="sm" variant="primary" icon={<Play className="w-3.5 h-3.5" />}>
              Start Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* ================= DASHBOARD ROW 1: METRIC CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Calories */}
        <MetricCard
          title="Calories"
          value={`${caloriesConsumed} / ${calorieTarget}`}
          unit="kcal"
          subValue={`${caloriesRemaining} kcal remaining`}
          icon={<Flame className="w-5 h-5" />}
          color="amber"
          progressPercent={(caloriesConsumed / calorieTarget) * 100}
        />

        {/* Protein */}
        <MetricCard
          title="Protein"
          value={`${proteinConsumed} / ${proteinTarget}`}
          unit="g"
          subValue={`${Math.max(0, proteinTarget - proteinConsumed)}g to daily target`}
          icon={<Zap className="w-5 h-5" />}
          color="emerald"
          progressPercent={(proteinConsumed / proteinTarget) * 100}
        />

        {/* Water */}
        <MetricCard
          title="Hydration"
          value={`${waterConsumedL} / ${waterTargetL}`}
          unit="L"
          subValue={`${Math.max(0, Math.round((waterTargetL - waterConsumedL) * 10) / 10)} L to goal`}
          icon={<Droplets className="w-5 h-5" />}
          color="cyan"
          progressPercent={(waterConsumedL / waterTargetL) * 100}
          onClick={() => setWaterModalOpen(true)}
        />

        {/* Today's Workout */}
        <MetricCard
          title="Workout"
          value={today?.todayWorkout ? "In Progress" : "Push Day"}
          subValue={
            today?.todayWorkout
              ? `${today.todayWorkout.totalSets} sets logged`
              : "Chest, Shoulders & Triceps (60 min)"
          }
          icon={<Dumbbell className="w-5 h-5" />}
          color="neutral"
          trend={{ value: `${streaks?.workoutStreak || 0}D Streak`, isPositive: true }}
        />
      </div>

      {/* ================= ROW 2: WORKOUT CARD & READINESS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Today's Workout Card (Section 17) */}
        <div className="lg:col-span-7">
          <GlassCard intensity="high" className="p-6 h-full flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <Badge variant="cyan" size="sm">TODAY&apos;S SESSION</Badge>
                  <h3 className="text-xl font-extrabold text-white mt-1">Push Day (Hypertrophy)</h3>
                  <p className="text-xs text-neutral-400">Duration: 60 min • Targeted Intensity: Moderate-Heavy</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  <Dumbbell className="w-5 h-5" />
                </div>
              </div>

              {/* Planned Exercises List */}
              <div className="space-y-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Exercises Scheduled
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {[
                    { name: "Barbell Bench Press", sets: "4 sets x 8 reps" },
                    { name: "Incline Dumbbell Press", sets: "3 sets x 10 reps" },
                    { name: "Overhead Dumbbell Press", sets: "3 sets x 10 reps" },
                    { name: "Tricep Rope Pushdown", sets: "3 sets x 12 reps" },
                  ].map((ex) => (
                    <div
                      key={ex.name}
                      className="p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between"
                    >
                      <span className="font-semibold text-neutral-200">{ex.name}</span>
                      <span className="text-[11px] text-neutral-400">{ex.sets}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-white/[0.08] flex items-center justify-between mt-4">
              <Link href="/workouts">
                <Button variant="ghost" size="sm">
                  View Full Plan
                </Button>
              </Link>
              <Link href="/workouts/active">
                <Button variant="primary" size="md" icon={<Play className="w-4 h-4" />}>
                  Start Workout
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Right: Fitness Score & Recovery Score (Section 18 & 19) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Recovery Score Card */}
          <GlassCard intensity="high" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Recovery Readiness
                </span>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-2xl font-black text-emerald-400">{recovery?.score || 84} / 100</h3>
                  <Badge variant="success" size="sm">{recovery?.status || "Good"}</Badge>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <HeartPulse className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {recovery?.explanation ||
                "Recovery is good today. Moderate-intensity training is appropriate based on your recent logs."}
            </p>
            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-[11px] text-neutral-500">
              <span>Sleep: {recovery?.sleepHours || 7.5}h logged</span>
              <Link href="/recovery" className="text-emerald-400 hover:underline">
                Log Recovery →
              </Link>
            </div>
          </GlassCard>

          {/* Fitness Score Card (Section 18) */}
          <GlassCard intensity="high" className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Consistency Fitness Score
                </span>
                <div className="flex items-baseline gap-2">
                  {fitnessScore?.score !== null ? (
                    <h3 className="text-2xl font-black text-cyan-400">{fitnessScore?.score} / 100</h3>
                  ) : (
                    <h3 className="text-lg font-bold text-neutral-400">Calibrating</h3>
                  )}
                  <Badge variant="cyan" size="sm">{fitnessScore?.status || "Active"}</Badge>
                </div>
              </div>
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <p className="text-xs text-neutral-300 leading-relaxed">
              {fitnessScore?.explanation || "Calculated from workout adherence, nutrition logs, and recovery cadence."}
            </p>
            {fitnessScore?.factors && (
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-neutral-400 pt-2 border-t border-white/[0.06]">
                <div>
                  <div className="font-bold text-white">{fitnessScore.factors.workoutConsistency}/35</div>
                  <div>Workouts</div>
                </div>
                <div>
                  <div className="font-bold text-white">{fitnessScore.factors.nutritionAdherence}/25</div>
                  <div>Macros</div>
                </div>
                <div>
                  <div className="font-bold text-white">{fitnessScore.factors.hydrationAdherence}/20</div>
                  <div>Water</div>
                </div>
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* ================= ROW 3: WEEKLY ACTIVITY & WEIGHT TREND ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Activity Chart (Section 20) */}
        <div className="lg:col-span-8">
          <GlassCard intensity="high" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Weekly Activity (Past 7 Days)</h3>
                <p className="text-xs text-neutral-400">Daily calorie intake vs targets</p>
              </div>
              <Badge variant="secondary">CALORIES (KCAL)</Badge>
            </div>

            <div className="h-60 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#525252" fontSize={11} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#10121A",
                      borderColor: "rgba(255,255,255,0.1)",
                      borderRadius: "12px",
                      fontSize: "12px",
                    }}
                    cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  />
                  <Bar dataKey="calories" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06] text-xs text-neutral-400">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Calories Logged
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Target: {calorieTarget} kcal
                </span>
              </div>
              <Link href="/progress" className="text-emerald-400 hover:underline">
                View Full Analytics →
              </Link>
            </div>
          </GlassCard>
        </div>

        {/* Weight Trend (Section 21) & Streaks */}
        <div className="lg:col-span-4 space-y-4">
          <GlassCard intensity="high" className="p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
              <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                Body Weight Trend
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>

            <div className="space-y-1">
              <div className="text-3xl font-black text-white">
                {weightTrend?.currentKg || 72.4} <span className="text-sm font-normal text-neutral-400">kg</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {weightTrend?.delta30DKg !== undefined ? `${weightTrend.delta30DKg} kg` : "-0.8 kg"}
                </span>
                <span className="text-neutral-400">over 30 days</span>
              </div>
            </div>

            <Link href="/weight" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full">
                Log New Weight Measurement
              </Button>
            </Link>
          </GlassCard>

          {/* Active Streaks Card */}
          <GlassCard intensity="medium" className="p-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
              Unbroken Daily Streaks
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Dumbbell className="w-4 h-4 text-cyan-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{streaks?.workoutStreak || 0}D</div>
                <div className="text-[10px] text-neutral-400">Workout</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Flame className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{streaks?.nutritionStreak || 0}D</div>
                <div className="text-[10px] text-neutral-400">Nutrition</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <Droplets className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                <div className="text-lg font-bold text-white">{streaks?.waterStreak || 0}D</div>
                <div className="text-[10px] text-neutral-400">Hydration</div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Quick Water Logging Modal */}
      <Modal
        isOpen={waterModalOpen}
        onClose={() => setWaterModalOpen(false)}
        title="Log Water Hydration"
        description="Select an amount or input custom milliliters."
      >
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2.5">
            {[250, 500, 750].map((amt) => (
              <button
                key={amt}
                onClick={() => setWaterAmount(amt)}
                className={`p-3 rounded-xl border text-sm font-bold transition-all ${
                  waterAmount === amt
                    ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300"
                    : "bg-white/[0.04] border-white/10 text-neutral-300 hover:text-white"
                }`}
              >
                +{amt} ml
              </button>
            ))}
          </div>

          <Input
            label="Custom Amount (ml)"
            type="number"
            step="50"
            min="50"
            max="3000"
            value={waterAmount}
            onChange={(e) => setWaterAmount(Number(e.target.value))}
          />

          <Button
            variant="primary"
            className="w-full mt-4"
            isLoading={loggingWater}
            onClick={() => handleLogWater(waterAmount)}
            icon={<Droplets className="w-4 h-4" />}
          >
            Confirm +{waterAmount} ml
          </Button>
        </div>
      </Modal>
    </div>
  );
}
