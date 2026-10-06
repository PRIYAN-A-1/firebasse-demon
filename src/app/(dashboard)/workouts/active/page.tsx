"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Timer,
  Play,
  Pause,
  Check,
  Plus,
  RotateCcw,
  Trophy,
  Flame,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { GlassCard } from "@/components/ui/GlassCard";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/components/ui/Toast";

interface WorkoutSetData {
  id: string;
  setNumber: number;
  weightKg: number;
  reps: number;
  rpe: number;
  isCompleted: boolean;
  isPr?: boolean;
}

interface ExercisePlan {
  name: string;
  targetSets: number;
  targetReps: string;
  restSeconds: number;
  previousBest: string;
  sets: WorkoutSetData[];
}

export default function ActiveWorkoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { success: toastSuccess, error: toastError } = useToast();

  const [workoutTitle, setWorkoutTitle] = useState("Push Day (Chest, Shoulders, Triceps)");
  const [sessionId, setSessionId] = useState<string | null>(null);

  // Stopwatch state
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(true);

  // Rest Timer state (Section 26)
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [restTimerActive, setRestTimerActive] = useState(false);

  // Active exercises
  const [exercises, setExercises] = useState<ExercisePlan[]>([
    {
      name: "Barbell Bench Press",
      targetSets: 4,
      targetReps: "8-10 reps",
      restSeconds: 90,
      previousBest: "60 kg × 8 reps",
      sets: [
        { id: "1", setNumber: 1, weightKg: 60, reps: 10, rpe: 8, isCompleted: true },
        { id: "2", setNumber: 2, weightKg: 60, reps: 9, rpe: 8, isCompleted: true },
        { id: "3", setNumber: 3, weightKg: 60, reps: 10, rpe: 8.5, isCompleted: false },
        { id: "4", setNumber: 4, weightKg: 65, reps: 8, rpe: 9, isCompleted: false },
      ],
    },
    {
      name: "Incline Dumbbell Press",
      targetSets: 3,
      targetReps: "10-12 reps",
      restSeconds: 90,
      previousBest: "22 kg × 10 reps",
      sets: [
        { id: "5", setNumber: 1, weightKg: 22, reps: 10, rpe: 8, isCompleted: false },
        { id: "6", setNumber: 2, weightKg: 22, reps: 10, rpe: 8, isCompleted: false },
        { id: "7", setNumber: 3, weightKg: 24, reps: 8, rpe: 9, isCompleted: false },
      ],
    },
    {
      name: "Overhead Dumbbell Shoulder Press",
      targetSets: 3,
      targetReps: "10-12 reps",
      restSeconds: 90,
      previousBest: "18 kg × 10 reps",
      sets: [
        { id: "8", setNumber: 1, weightKg: 18, reps: 10, rpe: 8, isCompleted: false },
        { id: "9", setNumber: 2, weightKg: 18, reps: 10, rpe: 8, isCompleted: false },
        { id: "10", setNumber: 3, weightKg: 20, reps: 8, rpe: 9, isCompleted: false },
      ],
    },
    {
      name: "Tricep Rope Pushdown",
      targetSets: 3,
      targetReps: "12-15 reps",
      restSeconds: 60,
      previousBest: "25 kg × 12 reps",
      sets: [
        { id: "11", setNumber: 1, weightKg: 25, reps: 12, rpe: 8, isCompleted: false },
        { id: "12", setNumber: 2, weightKg: 25, reps: 12, rpe: 8.5, isCompleted: false },
        { id: "13", setNumber: 3, weightKg: 27.5, reps: 10, rpe: 9, isCompleted: false },
      ],
    },
  ]);

  // Finish Summary Modal State (Section 27 & 28)
  const [finishModalOpen, setFinishModalOpen] = useState(false);
  const [completedSummary, setCompletedSummary] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize or fetch workout session
  useEffect(() => {
    const initSession = async () => {
      try {
        const res = await fetch("/api/workout-sessions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: workoutTitle }),
        });
        if (res.ok) {
          const data = await res.json();
          setSessionId(data.session?.id || null);
        }
      } catch (err) {
        console.error("Session init error:", err);
      }
    };
    initSession();
  }, [workoutTitle]);

  // Stopwatch Interval
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  // Rest Timer Countdown Interval
  useEffect(() => {
    let timer: any = null;
    if (restTimerActive && restSecondsRemaining !== null && restSecondsRemaining > 0) {
      timer = setInterval(() => {
        setRestSecondsRemaining((prev) => {
          if (prev === null || prev <= 1) {
            setRestTimerActive(false);
            toastSuccess("Rest Complete!", "Time for your next working set!");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [restTimerActive, restSecondsRemaining, toastSuccess]);

  const formatTimer = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${hrs > 0 ? `${String(hrs).padStart(2, "0")}:` : ""}${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const handleCompleteSet = async (exIndex: number, setIndex: number) => {
    const ex = exercises[exIndex];
    const s = ex.sets[setIndex];

    const newCompleted = !s.isCompleted;

    // Toggle set state
    setExercises((prev) => {
      const copy = [...prev];
      copy[exIndex].sets[setIndex].isCompleted = newCompleted;
      return copy;
    });

    if (newCompleted) {
      // Trigger Rest Timer
      setRestSecondsRemaining(ex.restSeconds || 90);
      setRestTimerActive(true);

      // Save Set to Backend via /api/workout-sessions/[id]/sets (Section 97, 122)
      if (sessionId) {
        try {
          const res = await fetch(`/api/workout-sessions/${sessionId}/sets`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              exerciseName: ex.name,
              setNumber: s.setNumber,
              weightKg: Number(s.weightKg),
              reps: Number(s.reps),
              rpe: Number(s.rpe),
              isCompleted: true,
            }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.isPr) {
              toastSuccess("🔥 NEW PERSONAL RECORD!", `${ex.name}: ${s.weightKg} kg (Beat previous best ${data.previousMaxWeight} kg)`);
              setExercises((prev) => {
                const copy = [...prev];
                copy[exIndex].sets[setIndex].isPr = true;
                return copy;
              });
            } else {
              toastSuccess("Set Logged", `Set ${s.setNumber}: ${s.weightKg} kg × ${s.reps} reps`);
            }
          }
        } catch (e) {
          console.error("Error saving set:", e);
        }
      }
    }
  };

  const handleFinishWorkout = async () => {
    setIsSaving(true);
    setIsRunning(false);

    const completedSetsList = exercises.flatMap((e) =>
      e.sets.filter((s) => s.isCompleted).map((s) => ({ ...s, exerciseName: e.name }))
    );

    const totalVolume = completedSetsList.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
    const totalReps = completedSetsList.reduce((acc, s) => acc + s.reps, 0);
    const prsList = completedSetsList.filter((s) => s.isPr).map((s) => `${s.exerciseName}: ${s.weightKg} kg`);

    if (sessionId) {
      try {
        const res = await fetch(`/api/workout-sessions/${sessionId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            durationSeconds: elapsedSeconds,
            notes: "Logged in FITTRACK Active Mode",
          }),
        });
        if (res.ok) {
          const data = await res.json();
          setCompletedSummary(data.summary);
          setFinishModalOpen(true);
          setIsSaving(false);
          return;
        }
      } catch (err) {
        console.error("Finish workout error:", err);
      }
    }

    // Fallback summary
    setCompletedSummary({
      durationSeconds: elapsedSeconds,
      totalSets: completedSetsList.length,
      totalReps,
      totalVolumeKg: totalVolume,
      estimatedCalories: Math.round((elapsedSeconds / 60) * 6.5),
      prs: prsList,
    });
    setFinishModalOpen(true);
    setIsSaving(false);
  };

  const totalExercises = exercises.length;
  const completedExercisesCount = exercises.filter((e) => e.sets.every((s) => s.isCompleted)).length;
  const totalSetsCount = exercises.reduce((acc, e) => acc + e.sets.length, 0);
  const completedSetsCount = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.isCompleted).length,
    0
  );
  const liveTotalVolume = exercises.reduce(
    (acc, e) => acc + e.sets.filter((s) => s.isCompleted).reduce((a, s) => a + s.weightKg * s.reps, 0),
    0
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      {/* Active Workout Header */}
      <GlassCard intensity="high" className="p-6 sticky top-16 z-20 shadow-2xl backdrop-blur-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <Badge variant="emerald" size="sm">ACTIVE TRAINING SESSION</Badge>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">{workoutTitle}</h1>
            <p className="text-xs text-neutral-400">
              Progress: <strong className="text-emerald-400 font-bold">{completedSetsCount}</strong> of {totalSetsCount} sets completed
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Timer Clock */}
            <div className="px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/10 flex items-center gap-2 text-white">
              <Timer className="w-4 h-4 text-emerald-400" />
              <span className="text-lg font-mono font-bold">{formatTimer(elapsedSeconds)}</span>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={handleFinishWorkout}
              isLoading={isSaving}
              icon={<Check className="w-4 h-4" />}
            >
              Finish Workout
            </Button>
          </div>
        </div>

        {/* Live Rest Timer Banner (Section 26) */}
        {restTimerActive && restSecondsRemaining !== null && (
          <div className="mt-4 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="text-xs">
                <span className="text-neutral-400">Rest Timer: </span>
                <strong className="text-cyan-300 font-mono text-base">{formatTimer(restSecondsRemaining)}</strong>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={() => setRestSecondsRemaining((prev) => (prev ? prev + 15 : 15))}
              >
                +15s
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setRestTimerActive(false);
                  setRestSecondsRemaining(0);
                }}
              >
                Skip Rest
              </Button>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Live Running Volume Tracker */}
      <div className="grid grid-cols-3 gap-3 text-center text-xs">
        <GlassCard intensity="low" className="p-3">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Total Volume Moved</span>
          <div className="text-lg font-black text-emerald-400">{liveTotalVolume} kg</div>
        </GlassCard>
        <GlassCard intensity="low" className="p-3">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Sets Completed</span>
          <div className="text-lg font-black text-cyan-400">{completedSetsCount} / {totalSetsCount}</div>
        </GlassCard>
        <GlassCard intensity="low" className="p-3">
          <span className="text-[10px] text-neutral-400 uppercase tracking-wider">Est. Calories</span>
          <div className="text-lg font-black text-amber-400">{Math.round((elapsedSeconds / 60) * 6.5)} kcal</div>
        </GlassCard>
      </div>

      {/* Exercises List */}
      <div className="space-y-6">
        {exercises.map((ex, exIndex) => (
          <GlassCard key={ex.name} intensity="high" className="p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-white/[0.08] gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                  Exercise {exIndex + 1} of {totalExercises}
                </span>
                <h3 className="text-lg font-extrabold text-white">{ex.name}</h3>
                <div className="flex items-center gap-3 text-xs text-neutral-400 mt-0.5">
                  <span>Target: {ex.targetSets} sets × {ex.targetReps}</span>
                  <span>•</span>
                  <span>Rest: {ex.restSeconds}s</span>
                </div>
              </div>
              <div className="text-xs text-neutral-400">
                Previous: <strong className="text-neutral-200">{ex.previousBest}</strong>
              </div>
            </div>

            {/* Sets Table (Section 25) */}
            <div className="space-y-2">
              <div className="grid grid-cols-12 gap-2 text-[11px] font-bold uppercase tracking-wider text-neutral-500 px-3">
                <span className="col-span-2">Set</span>
                <span className="col-span-3">Weight (kg)</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-2">RPE</span>
                <span className="col-span-2 text-right">Action</span>
              </div>

              {ex.sets.map((s, sIndex) => (
                <div
                  key={s.id}
                  className={`grid grid-cols-12 gap-2 items-center p-2.5 rounded-xl border transition-all ${
                    s.isCompleted
                      ? "bg-emerald-500/10 border-emerald-500/30 text-white"
                      : "bg-white/[0.02] border-white/[0.06] text-neutral-300"
                  }`}
                >
                  <div className="col-span-2 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                      {s.setNumber}
                    </span>
                    {s.isPr && (
                      <span className="text-[9px] font-bold text-amber-400 bg-amber-500/20 px-1 py-0.2 rounded">
                        PR
                      </span>
                    )}
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      step="0.5"
                      value={s.weightKg}
                      disabled={s.isCompleted}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExercises((prev) => {
                          const copy = [...prev];
                          copy[exIndex].sets[sIndex].weightKg = val;
                          return copy;
                        });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white disabled:opacity-75 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-3">
                    <input
                      type="number"
                      value={s.reps}
                      disabled={s.isCompleted}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExercises((prev) => {
                          const copy = [...prev];
                          copy[exIndex].sets[sIndex].reps = val;
                          return copy;
                        });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white disabled:opacity-75 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-2">
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="10"
                      value={s.rpe}
                      disabled={s.isCompleted}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setExercises((prev) => {
                          const copy = [...prev];
                          copy[exIndex].sets[sIndex].rpe = val;
                          return copy;
                        });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-2 py-1 text-xs text-white disabled:opacity-75 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="col-span-2 text-right">
                    <Button
                      size="sm"
                      variant={s.isCompleted ? "primary" : "outline"}
                      className="text-xs px-2.5 py-1"
                      onClick={() => handleCompleteSet(exIndex, sIndex)}
                      icon={s.isCompleted ? <Check className="w-3 h-3" /> : undefined}
                    >
                      {s.isCompleted ? "Done" : "Log"}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Workout Complete Celebration Modal (Section 27 & 28) */}
      <Modal
        isOpen={finishModalOpen}
        onClose={() => {
          setFinishModalOpen(false);
          router.push("/dashboard");
        }}
        title="Workout Complete!"
        description="Exceptional performance. Your session metrics and volume have been securely saved."
        maxWidth="md"
      >
        {completedSummary && (
          <div className="space-y-6 pt-2">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-[2px] mx-auto shadow-glow">
              <div className="w-full h-full bg-[#0A0C13] rounded-2xl flex items-center justify-center">
                <Trophy className="w-8 h-8 text-emerald-400" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Duration</div>
                <div className="text-lg font-black text-white">{formatTimer(completedSummary.durationSeconds)}</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Total Volume</div>
                <div className="text-lg font-black text-emerald-400">{completedSummary.totalVolumeKg} kg</div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Sets / Reps</div>
                <div className="text-lg font-black text-white">
                  {completedSummary.totalSets} sets ({completedSummary.totalReps} reps)
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                <div className="text-[10px] uppercase font-bold text-neutral-400">Est. Burn</div>
                <div className="text-lg font-black text-amber-400">{completedSummary.estimatedCalories} kcal</div>
              </div>
            </div>

            {completedSummary.prs && completedSummary.prs.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Sparkles className="w-4 h-4" /> Personal Records Broken:
                </div>
                {completedSummary.prs.map((pr: string, idx: number) => (
                  <div key={idx} className="text-neutral-200">
                    • {pr}
                  </div>
                ))}
              </div>
            )}

            <Button
              variant="primary"
              className="w-full"
              size="lg"
              onClick={() => {
                setFinishModalOpen(false);
                router.push("/dashboard");
              }}
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
