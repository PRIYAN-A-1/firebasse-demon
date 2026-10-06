"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Dumbbell,
  Search,
  Filter,
  Play,
  Sparkles,
  ChevronRight,
  Info,
  Clock,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Skeleton } from "@/components/ui/MetricCard";

export default function WorkoutsPage() {
  const [exercises, setExercises] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedExercise, setSelectedExercise] = useState<any | null>(null);

  const categories = [
    "All",
    "Chest",
    "Back",
    "Legs",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Core",
  ];

  const difficulties = ["All", "Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const queryParams = new URLSearchParams();
        if (selectedCategory !== "All") queryParams.append("category", selectedCategory);
        if (selectedDifficulty !== "All") queryParams.append("difficulty", selectedDifficulty);
        if (searchQuery) queryParams.append("q", searchQuery);

        const res = await fetch(`/api/exercises?${queryParams.toString()}`);
        if (res.ok) {
          const data = await res.json();
          setExercises(data.exercises || []);
        }
      } catch (err) {
        console.error("Error loading exercises:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, [selectedCategory, selectedDifficulty, searchQuery]);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="cyan" size="sm">WORKOUT ARCHITECTURE</Badge>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
            Training & Exercise Library
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Follow structured plans or build custom routines with progressive overload.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/ai-workout">
            <Button size="sm" variant="glass" icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}>
              AI Workout Generator
            </Button>
          </Link>
          <Link href="/workouts/active">
            <Button size="sm" variant="primary" icon={<Play className="w-3.5 h-3.5" />}>
              Start Live Workout
            </Button>
          </Link>
        </div>
      </div>

      {/* Featured Routine: Push Pull Legs */}
      <GlassCard intensity="high" glow="emerald" className="p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="emerald">FLAGSHIP ROUTINE</Badge>
              <span className="text-xs text-neutral-400">Intermediate • 6 Days Split</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white">
              Push Pull Legs (PPL) - Hypertrophy
            </h2>
            <p className="text-xs text-neutral-300 leading-relaxed">
              The gold-standard frequency protocol. Balances compound movements, mechanical tension, and 48-hour recovery windows.
            </p>
            <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-neutral-400">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400" /> 60 min/session
              </span>
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-400" /> ~350 kcal/session
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link href="/workouts/active?plan=ppl_push" className="w-full sm:w-auto">
              <Button size="md" variant="primary" className="w-full" icon={<Play className="w-4 h-4" />}>
                Launch Push Day
              </Button>
            </Link>
          </div>
        </div>
      </GlassCard>

      {/* Search & Category Filter Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search exercises by name or muscle (e.g. Bench, Squat, Delts)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-neutral-400 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
            />
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400" />
            <div className="flex gap-1.5">
              {difficulties.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                    selectedDifficulty === diff
                      ? "bg-white/15 text-white border border-white/20"
                      : "bg-white/[0.03] text-neutral-400 hover:text-white"
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-full transition-all shrink-0 ${
                selectedCategory === cat
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-semibold"
                  : "bg-white/[0.02] text-neutral-400 hover:text-white hover:bg-white/[0.06]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <GlassCard className="p-10 text-center space-y-2">
          <Dumbbell className="w-10 h-10 text-neutral-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No exercises found</h3>
          <p className="text-xs text-neutral-400">
            Try adjusting your search terms or category filters.
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {exercises.map((ex) => (
            <GlassCard
              key={ex.id}
              hoverEffect
              onClick={() => setSelectedExercise(ex)}
              className="p-5 flex flex-col justify-between space-y-3"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="neutral" size="sm">{ex.category}</Badge>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                    {ex.difficulty}
                  </span>
                </div>
                <h3 className="text-base font-extrabold text-white">{ex.name}</h3>
                <p className="text-xs text-neutral-400 line-clamp-2">
                  {ex.instructions}
                </p>
              </div>

              <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between text-xs text-neutral-400">
                <span>{ex.equipment}</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  View Form <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Exercise Details Modal (Section 23) */}
      <Modal
        isOpen={!!selectedExercise}
        onClose={() => setSelectedExercise(null)}
        title={selectedExercise?.name}
        description={`${selectedExercise?.category} • ${selectedExercise?.difficulty} • ${selectedExercise?.equipment}`}
        maxWidth="lg"
      >
        {selectedExercise && (
          <div className="space-y-4 text-xs">
            {/* Primary & Secondary Muscles */}
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1">
              <span className="font-bold text-neutral-300">Target Muscle Groups:</span>
              <div className="text-emerald-400 font-semibold">
                Primary: {selectedExercise.primaryMuscle}
              </div>
              {selectedExercise.secondaryMuscles && (
                <div className="text-neutral-400">
                  Secondary: {selectedExercise.secondaryMuscles}
                </div>
              )}
            </div>

            {/* Step-by-Step Instructions */}
            <div className="space-y-1">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">
                Execution Instructions
              </h4>
              <p className="text-neutral-300 leading-relaxed bg-white/[0.02] p-3 rounded-xl border border-white/[0.04]">
                {selectedExercise.instructions}
              </p>
            </div>

            {/* Pro Tips */}
            {selectedExercise.tips && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Coaching Cue:
                </span>
                <p className="text-neutral-300">{selectedExercise.tips}</p>
              </div>
            )}

            {/* Common Mistakes */}
            {selectedExercise.commonMistakes && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 space-y-1">
                <span className="font-bold">Avoid Common Mistakes:</span>
                <p className="text-neutral-300">{selectedExercise.commonMistakes}</p>
              </div>
            )}

            {/* Defaults */}
            <div className="grid grid-cols-3 gap-2 text-center pt-2">
              <div className="p-2.5 rounded-xl bg-white/[0.04]">
                <div className="text-neutral-400 text-[10px]">Sets</div>
                <div className="text-sm font-bold text-white">{selectedExercise.defaultSets}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04]">
                <div className="text-neutral-400 text-[10px]">Reps</div>
                <div className="text-sm font-bold text-white">{selectedExercise.defaultReps}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/[0.04]">
                <div className="text-neutral-400 text-[10px]">Rest</div>
                <div className="text-sm font-bold text-white">{selectedExercise.restSeconds}s</div>
              </div>
            </div>

            <div className="pt-4">
              <Link href={`/workouts/active?exercise=${encodeURIComponent(selectedExercise.name)}`}>
                <Button variant="primary" className="w-full" icon={<Play className="w-4 h-4" />}>
                  Add to Active Workout
                </Button>
              </Link>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
