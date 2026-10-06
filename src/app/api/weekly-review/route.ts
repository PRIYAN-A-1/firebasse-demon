import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const completedWorkouts = await prisma.workoutSession.findMany({
      where: {
        userId: user!.id,
        status: "completed",
        startedAt: { gte: sevenDaysAgo },
      },
    });

    const meals = await prisma.meal.findMany({
      where: {
        userId: user!.id,
        consumedAt: { gte: sevenDaysAgo },
      },
    });

    const recoveryLogs = await prisma.recoveryEntry.findMany({
      where: {
        userId: user!.id,
        loggedAt: { gte: sevenDaysAgo },
      },
      orderBy: { loggedAt: "desc" },
    });

    const weights = await prisma.weightEntry.findMany({
      where: {
        userId: user!.id,
        loggedAt: { gte: sevenDaysAgo },
      },
      orderBy: { loggedAt: "asc" },
    });

    const workoutsCount = completedWorkouts.length;
    const totalDuration = completedWorkouts.reduce((a, b) => a + (Math.round((b.durationSeconds || 0) / 60)), 0);
    const totalCaloriesBurned = Math.round(totalDuration * 7.5); // Estimate

    const distinctDaysWithMeals = Math.max(1, new Set(meals.map((m) => m.consumedAt.toDateString())).size);
    const avgCalories = meals.length > 0 ? meals.reduce((a, b) => a + b.totalCalories, 0) / distinctDaysWithMeals : 0;
    const avgProtein = meals.length > 0 ? meals.reduce((a, b) => a + b.totalProtein, 0) / distinctDaysWithMeals : 0;
    const avgCarbs = meals.length > 0 ? meals.reduce((a, b) => a + b.totalCarbs, 0) / distinctDaysWithMeals : 0;
    const avgFat = meals.length > 0 ? meals.reduce((a, b) => a + b.totalFat, 0) / distinctDaysWithMeals : 0;

    const avgSleep = recoveryLogs.length > 0 ? recoveryLogs.reduce((a, b) => a + b.sleepHours, 0) / recoveryLogs.length : 0;
    const avgScore = recoveryLogs.length > 0 ? Math.round(recoveryLogs.reduce((a, b) => a + b.calculatedScore, 0) / recoveryLogs.length) : 0;
    const avgEnergy = recoveryLogs.length > 0 ? recoveryLogs.reduce((a, b) => a + (b as any).energyLevel, 0) / recoveryLogs.length || 0 : 0;

    const startWeight = weights.length > 0 ? weights[0].weightKg : null;
    const endWeight = weights.length > 0 ? weights[weights.length - 1].weightKg : null;
    const weightChange = endWeight && startWeight ? endWeight - startWeight : 0;

    const score = Math.min(100, Math.round((workoutsCount / 4) * 40 + (distinctDaysWithMeals / 7) * 40 + (avgScore / 100) * 20));

    const aiSummary = `Here's your weekly summary: You've completed ${workoutsCount} workouts this week, burning an estimated ${totalCaloriesBurned} calories. Your nutrition tracking is on point, averaging ${Math.round(avgCalories)} calories and ${Math.round(avgProtein)}g protein per day. Keep pushing!`;

    const data = {
      weekStart: sevenDaysAgo.toISOString(),
      weekEnd: new Date().toISOString(),
      workouts: {
        total: workoutsCount,
        totalDuration,
        totalCaloriesBurned,
        sessions: completedWorkouts.map((w) => ({
          date: w.startedAt?.toISOString() || new Date().toISOString(),
          type: "strength",
          duration: Math.round((w.durationSeconds || 0) / 60),
        })),
      },
      nutrition: {
        avgCalories,
        avgProtein,
        avgCarbs,
        avgFat,
        loggedDays: distinctDaysWithMeals,
        totalMeals: meals.length,
      },
      recovery: {
        avgScore,
        avgSleep,
        avgEnergy,
        entries: recoveryLogs.length,
      },
      weight: {
        start: startWeight,
        end: endWeight,
        change: weightChange,
      },
      water: {
        avgLiters: 2.5,
        loggedDays: 7,
      },
      aiSummary,
      score,
    };

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Weekly review error:", err);
    return NextResponse.json({ success: false, error: "Failed to generate weekly review" }, { status: 500 });
  }
}
