"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Zap,
  ArrowRight,
  Camera,
  Dumbbell,
  Bot,
  TrendingUp,
  HeartPulse,
  Apple,
  CheckCircle2,
  Sparkles,
  Flame,
  Droplets,
  ShieldCheck,
  Play,
  RotateCcw,
  Check,
  ChevronRight,
} from "lucide-react";
import { Button } from "../ui/Button";
import { GlassCard } from "../ui/GlassCard";
import { Badge } from "../ui/Badge";
import { ProgressBar, ProgressRing } from "../ui/ProgressBar";

export const LandingPage: React.FC = () => {
  // Interactive Food Scanner Demo State
  const [biryaniGrams, setBiryaniGrams] = useState(300);
  const [eggCount, setEggCount] = useState(1);
  const [raitaGrams, setRaitaGrams] = useState(100);

  // Live scaled nutrition calculations
  const totalCalories = Math.round(
    biryaniGrams * 1.8 + eggCount * 78 + raitaGrams * 0.68
  );
  const totalProtein = Math.round(
    (biryaniGrams * 0.098 + eggCount * 6.5 + raitaGrams * 0.032) * 10
  ) / 10;
  const totalCarbs = Math.round(
    (biryaniGrams * 0.224 + eggCount * 0.6 + raitaGrams * 0.048) * 10
  ) / 10;
  const totalFat = Math.round(
    (biryaniGrams * 0.058 + eggCount * 5.5 + raitaGrams * 0.038) * 10
  ) / 10;

  // Interactive Workout Demo State
  const [activeSets, setActiveSets] = useState([
    { set: 1, weight: 60, reps: 10, completed: true },
    { set: 2, weight: 60, reps: 9, completed: true },
    { set: 3, weight: 60, reps: 10, completed: false },
    { set: 4, weight: 65, reps: 8, completed: false },
  ]);

  const toggleSet = (index: number) => {
    setActiveSets((prev) =>
      prev.map((s, idx) => (idx === index ? { ...s, completed: !s.completed } : s))
    );
  };

  return (
    <div className="relative overflow-hidden pt-24 pb-20">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-emerald-500/10 blur-[140px] pointer-events-none rounded-full" />
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 blur-[130px] pointer-events-none rounded-full" />

      {/* ================= SECTION 1: HERO ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20 lg:pt-16 lg:pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Fitness System</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08]">
              BUILD A <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
                STRONGER YOU
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              FITTRACK AI combines intelligent workouts, nutrition tracking, food photo analysis and personalized coaching to help users understand and improve their fitness.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link href="/register" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto" icon={<ArrowRight className="w-4 h-4" />}>
                  Start Free
                </Button>
              </Link>
              <Link href="#features" className="w-full sm:w-auto">
                <Button variant="glass" size="lg" className="w-full sm:w-auto">
                  Explore Features
                </Button>
              </Link>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-6 pt-4 text-xs font-semibold text-neutral-400">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> No guesswork
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real data
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" /> Smarter progress
              </span>
            </div>
          </div>

          {/* Right Interactive Dashboard Preview */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Outer Glass Card Container */}
              <div className="rounded-3xl border border-white/10 bg-[#0E111B]/80 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl relative">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent" />

                {/* Dashboard Header Bar */}
                <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                    <span className="text-xs font-bold text-neutral-400 ml-2">FitTrack Intelligence Suite</span>
                  </div>
                  <Badge variant="emerald" size="sm">LIVE DATA</Badge>
                </div>

                {/* Grid of Mini Widgets */}
                <div className="grid grid-cols-2 gap-3.5 mt-4">
                  {/* Calorie Progress */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                      <span className="font-semibold">Calories</span>
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="text-lg font-extrabold text-white">1,540 / 2,200</div>
                    <p className="text-[10px] text-neutral-400 mb-2">660 kcal remaining</p>
                    <ProgressBar value={1540} max={2200} showValues={false} color="amber" />
                  </div>

                  {/* Protein */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-2">
                      <span className="font-semibold">Protein</span>
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="text-lg font-extrabold text-white">90 / 130 g</div>
                    <p className="text-[10px] text-neutral-400 mb-2">40g to target</p>
                    <ProgressBar value={90} max={130} showValues={false} color="emerald" />
                  </div>

                  {/* Today's Workout */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                      <span className="font-semibold">Today&apos;s Workout</span>
                      <Dumbbell className="w-3.5 h-3.5 text-cyan-400" />
                    </div>
                    <div className="text-sm font-bold text-white">Push Day</div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">4 compound exercises • 60m</p>
                    <div className="mt-2 text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                      Ready to start <ArrowRight className="w-2.5 h-2.5" />
                    </div>
                  </div>

                  {/* Recovery Score */}
                  <div className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between text-xs text-neutral-400 mb-1">
                      <span className="font-semibold">Recovery</span>
                      <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div className="text-lg font-extrabold text-emerald-400">84 / 100</div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">Optimal • 7.8 hrs sleep</p>
                    <div className="mt-2 text-[10px] text-neutral-300">High training readiness</div>
                  </div>
                </div>

                {/* AI Coach Banner inside preview */}
                <div className="mt-3.5 p-3 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-emerald-950/40 border border-cyan-500/20 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
                      <span>AI Coach</span>
                      <span className="text-[10px] font-normal text-cyan-400/80">• Just now</span>
                    </div>
                    <p className="text-xs text-neutral-300 mt-0.5 leading-snug">
                      &quot;Recovery is 84% today. Your Push session is primed for progressive overload on Bench Press.&quot;
                    </p>
                  </div>
                </div>

                {/* Weight Trend Pill */}
                <div className="mt-3.5 flex items-center justify-between px-3.5 py-2 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs">
                  <span className="text-neutral-400">Weight Trend (30 Days)</span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">72.4 kg</span>
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-1.5 py-0.5 rounded text-[11px]">
                      -0.8 kg
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION 2: PRODUCT VALUE ================= */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
          <Badge variant="cyan">COMPREHENSIVE ECOSYSTEM</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            EVERYTHING YOUR FITNESS NEEDS
          </h2>
          <p className="text-neutral-400 text-sm">
            Engineered as a single unified platform so you never have to juggle multiple apps again.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GlassCard hoverEffect className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Food Scan</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Upload photos of your meals to identify foods automatically, calculate portions, and log calories and macros with one click.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Dumbbell className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Smart Workouts</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Follow tailored routines, track sets, weight, reps, and RPE with automated rest timers and automatic PR detection.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Coach</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Ask questions and get science-backed answers derived directly from your personal workout history and nutrition intake.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Progress Analytics</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Understand long-term fitness trends with charts for volume, strength progression, body weight, and macro adherence.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Apple className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Nutrition Intelligence</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Track calories, protein, carbs, fat, and fiber across Breakfast, Lunch, Dinner, and Snacks with extensive Indian & global foods.
            </p>
          </GlassCard>

          <GlassCard hoverEffect className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Recovery Intelligence</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Monitor nervous system readiness from sleep duration, muscle soreness, and stress to prevent overtraining.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ================= SECTION 3: FOOD SCANNER SHOWCASE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 space-y-5">
            <Badge variant="emerald">INTERACTIVE DEMO</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              AI FOOD SCANNER SHOWCASE
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Snap a photo of your plate. FITTRACK AI identifies composite meals, estimates portions, and references a canonical nutrition database per 100g.
            </p>
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
              <div className="font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-400" /> Human Review Rule
              </div>
              <p className="text-neutral-400">
                AI estimates must be reviewed before saving. Adjust portions live below to see how macros update instantly.
              </p>
            </div>
            <Link href="/nutrition/scan">
              <Button size="md" icon={<Camera className="w-4 h-4" />}>
                Scan Your Meal Now
              </Button>
            </Link>
          </div>

          <div className="lg:col-span-7">
            <GlassCard intensity="high" className="p-6 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center font-bold text-2xl text-black">
                    🍛
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Chicken Biryani Platter</h3>
                    <p className="text-xs text-neutral-400">Detected 3 food components</p>
                  </div>
                </div>
                <Badge variant="emerald">94% CONFIDENCE</Badge>
              </div>

              {/* Portion adjustment sliders */}
              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">1. Chicken Biryani</span>
                    <span className="font-semibold text-emerald-400">{biryaniGrams} grams</span>
                  </div>
                  <input
                    type="range"
                    min="100"
                    max="500"
                    step="25"
                    value={biryaniGrams}
                    onChange={(e) => setBiryaniGrams(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">2. Boiled Egg</span>
                    <span className="font-semibold text-emerald-400">{eggCount} whole egg</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="4"
                    step="1"
                    value={eggCount}
                    onChange={(e) => setEggCount(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-white">3. Cucumber Raita</span>
                    <span className="font-semibold text-emerald-400">{raitaGrams} grams</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="250"
                    step="25"
                    value={raitaGrams}
                    onChange={(e) => setRaitaGrams(Number(e.target.value))}
                    className="w-full accent-emerald-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Recalculated Live Totals */}
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center justify-between text-xs font-semibold text-neutral-300 mb-2">
                  <span>Meal Total (Scaled Live)</span>
                  <span className="text-emerald-400 font-bold">{totalCalories} kcal</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-lg bg-black/40">
                    <div className="text-[10px] text-neutral-400">Protein</div>
                    <div className="text-sm font-bold text-white">{totalProtein}g</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40">
                    <div className="text-[10px] text-neutral-400">Carbs</div>
                    <div className="text-sm font-bold text-white">{totalCarbs}g</div>
                  </div>
                  <div className="p-2 rounded-lg bg-black/40">
                    <div className="text-[10px] text-neutral-400">Fat</div>
                    <div className="text-sm font-bold text-white">{totalFat}g</div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* ================= SECTION 4: WORKOUT EXPERIENCE ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 order-2 lg:order-1">
            <GlassCard intensity="high" className="p-6 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
                <div>
                  <h3 className="text-lg font-extrabold text-white">Barbell Bench Press</h3>
                  <p className="text-xs text-neutral-400">Target: 4 sets • 8–10 reps • Rest 90s</p>
                </div>
                <Badge variant="cyan">SET TRACKING</Badge>
              </div>

              <div className="space-y-2.5">
                {activeSets.map((s, index) => (
                  <div
                    key={s.set}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                      s.completed
                        ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                        : "bg-white/[0.02] border-white/[0.06] text-neutral-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                        {s.set}
                      </span>
                      <div className="text-xs font-medium">
                        <strong className="text-white font-bold">{s.weight} kg</strong> × {s.reps} reps
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={s.completed ? "primary" : "outline"}
                      onClick={() => toggleSet(index)}
                      icon={s.completed ? <Check className="w-3.5 h-3.5" /> : undefined}
                    >
                      {s.completed ? "Completed" : "Complete Set"}
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-neutral-400">
                <span>Completed Sets: {activeSets.filter((s) => s.completed).length} / 4</span>
                <span className="text-emerald-400 font-bold">Volume: {activeSets.filter((s) => s.completed).reduce((a, b) => a + b.weight * b.reps, 0)} kg</span>
              </div>
            </GlassCard>
          </div>

          <div className="lg:col-span-5 order-1 lg:order-2 space-y-5">
            <Badge variant="cyan">PRO OVERLOAD LOGGING</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              INTUITIVE WORKOUT LOGGING
            </h2>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Log working sets with precision. Keep track of weight, reps, and RPE. Automatic rest timers keep your sessions focused and prompt you when your next set begins.
            </p>
            <Link href="/workouts">
              <Button size="md" variant="cyan" icon={<Dumbbell className="w-4 h-4" />}>
                Explore Workout System
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= SECTION 5: AI COACH ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <Badge variant="emerald">REAL-TIME INTELLIGENCE</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">AI FITNESS COACH</h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Context-aware coaching that analyzes your logged workouts, macros, and sleep.
            </p>
          </div>

          <GlassCard intensity="high" className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
                You
              </div>
              <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/[0.08] text-xs text-white max-w-md">
                &quot;What should I train today? Should I go heavy?&quot;
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center text-xs font-bold shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/30 to-emerald-950/30 border border-cyan-500/20 text-xs text-neutral-200 space-y-2 max-w-lg">
                <p>
                  Looking at your history, your last session was <strong>Push Day</strong> 48 hours ago, and your recovery score today is <strong>84/100</strong> (7.8h sleep).
                </p>
                <p>
                  Today is optimal for <strong>Pull Day (Back & Biceps)</strong>. Since your recovery is high, aim for heavy compound rows (8–10 reps) and lat pulldowns with progressive overload.
                </p>
              </div>
            </div>

            <div className="pt-2 text-center">
              <Link href="/ai-coach">
                <Button size="sm" variant="glass" icon={<ChevronRight className="w-3.5 h-3.5" />}>
                  Chat With AI Coach
                </Button>
              </Link>
            </div>
          </GlassCard>
        </div>
      </section>

      {/* ================= SECTION 6: HOW IT WORKS ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-14">
          <Badge variant="neutral">THE WORKFLOW</Badge>
          <h2 className="text-3xl font-extrabold text-white">HOW IT WORKS</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <GlassCard className="space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center mx-auto text-sm border border-emerald-500/20">
              1
            </div>
            <h4 className="text-sm font-bold text-white">Create Profile</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Complete onboarding with your biometric stats, experience level, equipment, and fitness goal.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 text-cyan-400 font-extrabold flex items-center justify-center mx-auto text-sm border border-cyan-500/20">
              2
            </div>
            <h4 className="text-sm font-bold text-white">Track Workouts & Meals</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Log working sets in real-time and scan your meal plates with AI food photography.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 font-extrabold flex items-center justify-center mx-auto text-sm border border-amber-500/20">
              3
            </div>
            <h4 className="text-sm font-bold text-white">AI Learns From Data</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The engine continuously cross-references volume, calories, sleep, and progressive overload.
            </p>
          </GlassCard>

          <GlassCard className="space-y-3 text-center">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-400 font-extrabold flex items-center justify-center mx-auto text-sm border border-emerald-500/20">
              4
            </div>
            <h4 className="text-sm font-bold text-white">Personalized Insights</h4>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Receive automated fitness score calibrations, recovery advice, and weekly AI reviews.
            </p>
          </GlassCard>
        </div>
      </section>

      {/* ================= SECTION 7: PRICING ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-white/[0.06]">
        <div className="text-center max-w-xl mx-auto space-y-2 mb-14">
          <Badge variant="amber">TRANSPARENT VALUE</Badge>
          <h2 className="text-3xl font-extrabold text-white">SIMPLE, HONEST PRICING</h2>
          <p className="text-xs text-neutral-400">Unlock your ultimate physical potential without hidden catches.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <GlassCard className="p-8 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <Badge variant="neutral">STANDARD</Badge>
              <h3 className="text-2xl font-extrabold text-white">Free Forever</h3>
              <div className="text-3xl font-black text-white">
                $0 <span className="text-xs text-neutral-400 font-normal">/ month</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-300">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Full workout & exercise tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Manual meal and hydration tracking
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Weight trend & body metrics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Basic dashboard & fitness score
                </li>
              </ul>
            </div>
            <Link href="/register">
              <Button variant="secondary" className="w-full">
                Get Started Free
              </Button>
            </Link>
          </GlassCard>

          {/* Premium Tier */}
          <GlassCard intensity="high" glow="emerald" className="p-8 space-y-6 flex flex-col justify-between relative">
            <div className="absolute top-4 right-4">
              <Badge variant="amber">RECOMMENDED</Badge>
            </div>
            <div className="space-y-4">
              <Badge variant="emerald">ELITE ATHLETE</Badge>
              <h3 className="text-2xl font-extrabold text-white">Pro Plan</h3>
              <div className="text-3xl font-black text-white">
                $12.99 <span className="text-xs text-neutral-400 font-normal">/ month (or ₹999/mo)</span>
              </div>
              <ul className="space-y-3 text-xs text-neutral-200">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Unlimited AI Food Photo Scans
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Unlimited AI Fitness Coach consultations
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Structured AI Workout Routine Generator
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Automated Weekly AI Performance Reviews
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" /> Recovery score analytics & streak freeze
                </li>
              </ul>
            </div>
            <Link href="/register">
              <Button variant="primary" className="w-full" icon={<Sparkles className="w-4 h-4" />}>
                Unlock Pro Access
              </Button>
            </Link>
          </GlassCard>
        </div>
      </section>

      {/* ================= SECTION 8: FINAL CTA ================= */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 text-center">
        <GlassCard intensity="high" className="p-10 md:p-14 space-y-6 relative overflow-hidden">
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-emerald-500/20 blur-[100px] pointer-events-none rounded-full" />
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            START BUILDING YOUR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              STRONGEST SELF TODAY
            </span>
          </h2>
          <p className="text-sm text-neutral-300 max-w-lg mx-auto">
            Join thousands of lifters, athletes, and nutrition-conscious individuals making continuous, data-driven progress.
          </p>
          <div className="pt-2">
            <Link href="/register">
              <Button size="lg" icon={<ArrowRight className="w-4 h-4" />}>
                Create Free Account
              </Button>
            </Link>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
