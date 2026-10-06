export interface FitnessScoreResult {
  score: number | null; // null if insufficient history
  status: string;
  explanation: string;
  factors: {
    workoutConsistency: number;
    nutritionAdherence: number;
    hydrationAdherence: number;
    recoveryScore: number;
  };
}

export function calculateRecoveryScore(params: {
  sleepHours: number;
  soreness: number; // 1-5 (1=none, 5=extreme)
  stress: number;   // 1-5 (1=low, 5=high)
  energy: number;   // 1-5 (1=exhausted, 5=peak)
}): { score: number; status: string; explanation: string } {
  const { sleepHours, soreness, stress, energy } = params;

  // Sleep factor (optimal 7.5 - 9 hrs) -> up to 35 points
  let sleepScore = 0;
  if (sleepHours >= 8) sleepScore = 35;
  else if (sleepHours >= 7) sleepScore = 30;
  else if (sleepHours >= 6) sleepScore = 22;
  else if (sleepHours >= 5) sleepScore = 14;
  else sleepScore = 8;

  // Energy factor (1-5) -> up to 25 points
  const energyScore = (energy / 5) * 25;

  // Soreness deduction (1-5, where 1 is best) -> up to 20 points
  const sorenessScore = ((6 - soreness) / 5) * 20;

  // Stress deduction (1-5, where 1 is lowest stress) -> up to 20 points
  const stressScore = ((6 - stress) / 5) * 20;

  const total = Math.min(100, Math.max(10, Math.round(sleepScore + energyScore + sorenessScore + stressScore)));

  let status = "Optimal";
  let explanation = "Recovery is good today. Moderate to high-intensity training is appropriate based on your recent logs.";

  if (total < 50) {
    status = "Fatigued";
    explanation = "Elevated nervous system fatigue and low sleep detected. Prioritize active recovery, light stretching, and adequate nutrition today.";
  } else if (total < 75) {
    status = "Moderate";
    explanation = "Recovery is moderate today. Standard intensity training is suitable; ensure warmups are thorough.";
  }

  return {
    score: total,
    status,
    explanation,
  };
}

export function calculateFitnessScore(params: {
  totalLoggedDays: number;
  workoutsPast7Days: number;
  targetWorkoutsPerWeek: number;
  avgCaloriesPast7Days: number;
  targetCalories: number;
  avgWaterMlPast7Days: number;
  targetWaterMl: number;
  latestRecoveryScore: number | null;
}): FitnessScoreResult {
  const {
    totalLoggedDays,
    workoutsPast7Days,
    targetWorkoutsPerWeek,
    avgCaloriesPast7Days,
    targetCalories,
    avgWaterMlPast7Days,
    targetWaterMl,
    latestRecoveryScore,
  } = params;

  // Rule: Insufficient history if user has logged less than 2 distinct days
  if (totalLoggedDays < 2) {
    return {
      score: null,
      status: "Calibrating",
      explanation: "Keep tracking your workouts, meals, and hydration to unlock your personalized Fitness Score.",
      factors: {
        workoutConsistency: 0,
        nutritionAdherence: 0,
        hydrationAdherence: 0,
        recoveryScore: 0,
      },
    };
  }

  // 1. Workout Consistency (35%)
  const workoutRatio = Math.min(1.2, workoutsPast7Days / Math.max(1, targetWorkoutsPerWeek));
  const workoutPoints = Math.min(35, workoutRatio * 35);

  // 2. Nutrition Adherence (25%)
  let nutritionPoints = 15;
  if (avgCaloriesPast7Days > 0 && targetCalories > 0) {
    const calorieDiffRatio = Math.abs(avgCaloriesPast7Days - targetCalories) / targetCalories;
    if (calorieDiffRatio <= 0.1) nutritionPoints = 25;
    else if (calorieDiffRatio <= 0.2) nutritionPoints = 20;
    else if (calorieDiffRatio <= 0.3) nutritionPoints = 15;
    else nutritionPoints = 10;
  }

  // 3. Hydration Adherence (20%)
  const waterRatio = Math.min(1, avgWaterMlPast7Days / Math.max(1000, targetWaterMl));
  const hydrationPoints = waterRatio * 20;

  // 4. Recovery Score (20%)
  const recoveryPoints = ((latestRecoveryScore || 75) / 100) * 20;

  const total = Math.min(100, Math.max(20, Math.round(workoutPoints + nutritionPoints + hydrationPoints + recoveryPoints)));

  let status = "Excellent";
  let explanation = "Outstanding consistency across training, nutrition, and recovery balance.";

  if (total < 60) {
    status = "Building Rhythm";
    explanation = "Consistency is improving. Focus on hitting daily water targets and regular workout sessions.";
  } else if (total < 80) {
    status = "Strong";
    explanation = "Strong weekly adherence with balanced progress across workouts and nutrition.";
  }

  return {
    score: total,
    status,
    explanation,
    factors: {
      workoutConsistency: Math.round(workoutPoints),
      nutritionAdherence: Math.round(nutritionPoints),
      hydrationAdherence: Math.round(hydrationPoints),
      recoveryScore: Math.round(recoveryPoints),
    },
  };
}
