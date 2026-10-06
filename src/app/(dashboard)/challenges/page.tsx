"use client";

import { useState, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  targetValue: number;
  unit: string;
  durationDays: number;
  difficulty: string;
  badgeEmoji: string;
  participants: number;
  userProgress?: {
    id: string;
    currentValue: number;
    completed: boolean;
    joinedAt: string;
  } | null;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  beginner: "emerald",
  intermediate: "blue",
  advanced: "purple",
  expert: "red",
};

const DIFFICULTY_LABELS: Record<string, string> = {
  beginner: "🟢 Beginner",
  intermediate: "🔵 Intermediate",
  advanced: "🟣 Advanced",
  expert: "🔴 Expert",
};

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "joined" | "completed">("all");
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchChallenges = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/challenges");
      const json = await res.json();
      if (json.success) setChallenges(json.data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const joinChallenge = async (id: string) => {
    setJoiningId(id);
    try {
      const res = await fetch("/api/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId: id }),
      });
      const json = await res.json();
      if (json.success) {
        showToast("Challenge joined! 🎯 Let's go!");
        fetchChallenges();
      } else {
        showToast(json.error || "Failed to join", "error");
      }
    } catch {
      showToast("Network error", "error");
    } finally {
      setJoiningId(null);
    }
  };

  const updateProgress = async (challengeId: string, progressId: string, currentValue: number) => {
    try {
      const res = await fetch("/api/challenges", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ progressId, currentValue }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.data?.completed ? "🏆 Challenge completed!" : "Progress updated!");
        fetchChallenges();
      }
    } catch {
      showToast("Failed to update", "error");
    }
  };

  const filteredChallenges = challenges.filter((c) => {
    if (filter === "joined") return c.userProgress && !c.userProgress.completed;
    if (filter === "completed") return c.userProgress?.completed;
    return true;
  });

  const joinedCount = challenges.filter((c) => c.userProgress && !c.userProgress.completed).length;
  const completedCount = challenges.filter((c) => c.userProgress?.completed).length;

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
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Fitness Challenges</h1>
          <p className="text-gray-400 mt-1">Join challenges, earn badges, push your limits</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-emerald-400">{joinedCount}</div>
            <div className="text-xs text-gray-500">Active</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-400">{completedCount}</div>
            <div className="text-xs text-gray-500">Completed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {(["all", "joined", "completed"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${
              filter === f ? "bg-emerald-500 text-white" : "text-gray-400 hover:text-white"
            }`}
          >
            {f === "joined" ? `Active (${joinedCount})` : f === "completed" ? `Done (${completedCount})` : "All"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <div className="w-10 h-10 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      ) : filteredChallenges.length === 0 ? (
        <GlassCard className="p-12 text-center">
          <div className="text-5xl mb-4">🏆</div>
          <p className="text-gray-400 text-lg">
            {filter === "joined" ? "No active challenges. Join one below!" :
              filter === "completed" ? "No completed challenges yet. Keep pushing!" :
                "No challenges available yet."}
          </p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredChallenges.map((challenge) => {
            const color = DIFFICULTY_COLORS[challenge.difficulty] || "emerald";
            const progress = challenge.userProgress;
            const pct = progress ? Math.min(100, (progress.currentValue / challenge.targetValue) * 100) : 0;
            const isCompleted = progress?.completed;
            const isJoined = !!progress;

            return (
              <GlassCard
                key={challenge.id}
                className={`p-5 flex flex-col gap-4 relative overflow-hidden ${
                  isCompleted ? "border border-yellow-500/30 bg-yellow-500/5" : ""
                }`}
              >
                {isCompleted && (
                  <div className="absolute top-3 right-3 text-2xl">🏆</div>
                )}

                {/* Challenge Header */}
                <div className="flex items-start gap-3">
                  <div className={`w-14 h-14 rounded-2xl bg-${color}-500/10 border border-${color}-500/20 flex items-center justify-center text-3xl shrink-0`}>
                    {challenge.badgeEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-white text-sm leading-tight">{challenge.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{challenge.description}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-xs text-${color}-400`}>{DIFFICULTY_LABELS[challenge.difficulty]}</span>
                      <span className="text-xs text-gray-600">•</span>
                      <span className="text-xs text-gray-500">{challenge.durationDays} days</span>
                    </div>
                  </div>
                </div>

                {/* Target */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5">
                  <span className="text-xs text-gray-400">Target:</span>
                  <span className="text-sm font-bold text-white">{challenge.targetValue} {challenge.unit}</span>
                  <span className="ml-auto text-xs text-gray-500">👥 {challenge.participants} joined</span>
                </div>

                {/* Progress (if joined) */}
                {isJoined && !isCompleted && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">{progress.currentValue} / {challenge.targetValue} {challenge.unit}</span>
                      <span className={`text-${color}-400`}>{Math.round(pct)}%</span>
                    </div>
                    <ProgressBar value={pct} max={100} label="" color={color as any} showValues={false} />
                  </div>
                )}

                {/* CTA */}
                {isCompleted ? (
                  <div className="px-4 py-2 bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm font-medium rounded-xl text-center">
                    ✅ Completed! Great work!
                  </div>
                ) : isJoined ? (
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder={`Log progress (${challenge.unit})`}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                      id={`ch-prog-${challenge.id}`}
                    />
                    <button
                      onClick={() => {
                        const input = document.getElementById(`ch-prog-${challenge.id}`) as HTMLInputElement;
                        const val = parseFloat(input.value);
                        if (!isNaN(val) && progress) {
                          updateProgress(challenge.id, progress.id, val);
                          input.value = "";
                        }
                      }}
                      className={`px-3 py-1.5 bg-${color}-500/20 hover:bg-${color}-500/30 text-${color}-400 text-xs rounded-lg transition-all`}
                    >
                      Log
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => joinChallenge(challenge.id)}
                    disabled={joiningId === challenge.id}
                    className={`w-full py-2.5 bg-gradient-to-r from-${color}-500 to-${color}-400 hover:opacity-90 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-${color}-500/25`}
                  >
                    {joiningId === challenge.id ? "Joining..." : "Join Challenge"}
                  </button>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
