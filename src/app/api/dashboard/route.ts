import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { calculateFitnessScore } from "@/lib/analytics/fitness-score";
import { computeDailyStreak } from "@/lib/analytics/streak";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    // 1. Fetch Today's Meals
    const todayMeals = await prisma.meal.findMany({
      where: {
        userId: user.id,
        consumedAt: { gte: todayStart },
      },
      include: { items: true },
    });

    const todayCalories = todayMeals.reduce((acc, m) => acc + m.totalCalories, 0);
    const todayProtein = todayMeals.reduce((acc, m) => acc + m.totalProtein, 0);
    const todayCarbs = todayMeals.reduce((acc, m) => acc + m.totalCarbs, 0);
    const todayFat = todayMeals.reduce((acc, m) => acc + m.totalFat, 0);
    const todayFiber = todayMeals.reduce((acc, m) => acc + m.totalFiber, 0);

    // 2. Fetch Today's Water
    const todayWaterEntries = await prisma.waterEntry.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
    });
    const todayWaterMl = todayWaterEntries.reduce((acc, w) => acc + w.amountMl, 0);

    // 3. Fetch Recent Workouts (Past 7 Days & Today)
    const recentWorkouts = await prisma.workoutSession.findMany({
      where: {
        userId: user.id,
        startedAt: { gte: sevenDaysAgo },
      },
      include: { sets: true },
      orderBy: { startedAt: "desc" },
    });

    const todayWorkout = recentWorkouts.find((w) => new Date(w.startedAt) >= todayStart);

    // 4. Recovery Score
    const latestRecovery = await prisma.recoveryEntry.findFirst({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
    });

    // 5. Weight Trend
    const recentWeights = await prisma.weightEntry.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: thirtyDaysAgo },
      },
      orderBy: { loggedAt: "asc" },
    });

    const currentWeight = recentWeights.length > 0 ? recentWeights[recentWeights.length - 1].weightKg : user.profile?.weight || 70;
    const initialWeight30D = recentWeights.length > 0 ? recentWeights[0].weightKg : currentWeight;
    const weightDelta30D = Math.round((currentWeight - initialWeight30D) * 10) / 10;

    // 6. Streaks
    const allWorkoutSessions = await prisma.workoutSession.findMany({
      where: { userId: user.id, status: "completed" },
      select: { startedAt: true },
    });
    const allMeals = await prisma.meal.findMany({
      where: { userId: user.id },
      select: { consumedAt: true },
    });
    const allWater = await prisma.waterEntry.findMany({
      where: { userId: user.id },
      select: { loggedAt: true },
    });

    const workoutStreak = computeDailyStreak(allWorkoutSessions.map((w) => w.startedAt));
    const nutritionStreak = computeDailyStreak(allMeals.map((m) => m.consumedAt));
    const waterStreak = computeDailyStreak(allWater.map((w) => w.loggedAt));

    // 7. 7-Day Chart Data Aggregation
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const dayEnd = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59);

      const dayName = d.toLocaleDateString("en-US", { weekday: "short" });

      const dayMeals = await prisma.meal.findMany({
        where: {
          userId: user.id,
          consumedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      const dayWater = await prisma.waterEntry.findMany({
        where: {
          userId: user.id,
          loggedAt: { gte: dayStart, lte: dayEnd },
        },
      });

      const dayWorkouts = await prisma.workoutSession.count({
        where: {
          userId: user.id,
          startedAt: { gte: dayStart, lte: dayEnd },
          status: "completed",
        },
      });

      chartData.push({
        day: dayName,
        calories: dayMeals.reduce((acc, m) => acc + m.totalCalories, 0),
        protein: dayMeals.reduce((acc, m) => acc + m.totalProtein, 0),
        waterL: Math.round((dayWater.reduce((acc, w) => acc + w.amountMl, 0) / 1000) * 10) / 10,
        workouts: dayWorkouts,
      });
    }

    // 8. Calculate Fitness Score
    const distinctLoggedDays = new Set([
      ...allMeals.map((m) => m.consumedAt.toDateString()),
      ...allWorkoutSessions.map((w) => w.startedAt.toDateString()),
      ...allWater.map((w) => w.loggedAt.toDateString()),
    ]).size;

    const completedWorkouts7D = recentWorkouts.filter((w) => w.status === "completed").length;
    const avgCal7D = Math.round(chartData.reduce((acc, c) => acc + c.calories, 0) / 7);
    const avgWater7D = Math.round(chartData.reduce((acc, c) => acc + c.waterL * 1000, 0) / 7);

    const fitnessScore = calculateFitnessScore({
      totalLoggedDays: distinctLoggedDays,
      workoutsPast7Days: completedWorkouts7D,
      targetWorkoutsPerWeek: user.fitnessPreference?.daysPerWeek || 4,
      avgCaloriesPast7Days: avgCal7D,
      targetCalories: user.fitnessPreference?.calorieTarget || 2200,
      avgWaterMlPast7Days: avgWater7D,
      targetWaterMl: user.fitnessPreference?.waterTargetMl || 3000,
      latestRecoveryScore: latestRecovery?.calculatedScore || null,
    });

    // 9. Active Goals
    const goals = await prisma.fitnessGoal.findMany({
      where: { userId: user.id },
      take: 3,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      userName: user.name,
      greeting: "Good Morning",
      profile: user.profile,
      targets: {
        calorieTarget: user.fitnessPreference?.calorieTarget || 2200,
        proteinTarget: user.fitnessPreference?.proteinTarget || 130,
        carbsTarget: user.fitnessPreference?.carbsTarget || 250,
        fatTarget: user.fitnessPreference?.fatTarget || 70,
        waterTargetMl: user.fitnessPreference?.waterTargetMl || 3000,
      },
      today: {
        calories: Math.round(todayCalories),
        protein: Math.round(todayProtein),
        carbs: Math.round(todayCarbs),
        fat: Math.round(todayFat),
        fiber: Math.round(todayFiber),
        waterMl: todayWaterMl,
        todayWorkout: todayWorkout
          ? {
              id: todayWorkout.id,
              title: todayWorkout.title,
              status: todayWorkout.status,
              durationSeconds: todayWorkout.durationSeconds,
              totalSets: todayWorkout.totalSets,
              totalVolumeKg: todayWorkout.totalVolumeKg,
            }
          : null,
      },
      fitnessScore,
      recovery: latestRecovery
        ? {
            score: latestRecovery.calculatedScore,
            status: latestRecovery.calculatedScore >= 75 ? "Good" : latestRecovery.calculatedScore >= 50 ? "Moderate" : "Fatigued",
            sleepHours: latestRecovery.sleepHours,
            explanation: latestRecovery.calculatedScore >= 75
              ? "Recovery is good today. Moderate to high-intensity training is appropriate based on your recent logs."
              : "Fatigue detected. Ensure hydration, nutrition, and adequate mobility today.",
          }
        : {
            score: 82,
            status: "Good",
            sleepHours: 7.5,
            explanation: "Log your daily recovery to receive tailored training readiness scores.",
          },
      weightTrend: {
        currentKg: currentWeight,
        delta30DKg: weightDelta30D,
      },
      streaks: {
        workoutStreak,
        nutritionStreak,
        waterStreak,
      },
      chartData,
      goals,
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
