export interface NutritionItem {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export function scaleNutrition(
  baseNutrition: NutritionItem,
  quantity: number,
  servingBasis: number = 100
): NutritionItem {
  if (servingBasis <= 0 || quantity <= 0) {
    return { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 };
  }

  const factor = quantity / servingBasis;

  return {
    calories: Math.round(baseNutrition.calories * factor * 10) / 10,
    protein: Math.round(baseNutrition.protein * factor * 10) / 10,
    carbs: Math.round(baseNutrition.carbs * factor * 10) / 10,
    fat: Math.round(baseNutrition.fat * factor * 10) / 10,
    fiber: Math.round((baseNutrition.fiber || 0) * factor * 10) / 10,
  };
}

export function calculateMealTotals(items: { calories: number; protein: number; carbs: number; fat: number; fiber?: number }[]) {
  return items.reduce(
    (acc, curr) => ({
      calories: Math.round((acc.calories + curr.calories) * 10) / 10,
      protein: Math.round((acc.protein + curr.protein) * 10) / 10,
      carbs: Math.round((acc.carbs + curr.carbs) * 10) / 10,
      fat: Math.round((acc.fat + curr.fat) * 10) / 10,
      fiber: Math.round(((acc.fiber || 0) + (curr.fiber || 0)) * 10) / 10,
    }),
    { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
  );
}

export function calculateMacroTargets(params: {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  activityLevel: string;
  fitnessGoal: string;
}) {
  const { weightKg, heightCm, age, gender, activityLevel, fitnessGoal } = params;

  // Mifflin-St Jeor Equation for BMR
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === "male") {
    bmr += 5;
  } else {
    bmr -= 161;
  }

  // Activity Multipliers
  const activityFactors: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
  };

  const factor = activityFactors[activityLevel] || 1.4;
  let tdee = Math.round(bmr * factor);

  // Goal calorie adjustment
  let calorieTarget = tdee;
  if (fitnessGoal === "lose_weight") {
    calorieTarget = Math.max(1400, tdee - 500); // 500 kcal deficit
  } else if (fitnessGoal === "build_muscle" || fitnessGoal === "gain_strength") {
    calorieTarget = tdee + 300; // 300 kcal surplus
  } else if (fitnessGoal === "body_recomp") {
    calorieTarget = Math.round(tdee * 0.95);
  }

  // Protein targets (2.0g per kg for muscle building/fat loss retention)
  const proteinTarget = Math.round(Math.min(240, Math.max(90, weightKg * 1.8)));

  // Fat targets (~25-30% of calories)
  const fatCalories = calorieTarget * 0.25;
  const fatTarget = Math.round(fatCalories / 9);

  // Remaining calories to Carbs
  const proteinAndFatCalories = proteinTarget * 4 + fatTarget * 9;
  const remainingCalories = Math.max(200, calorieTarget - proteinAndFatCalories);
  const carbsTarget = Math.round(remainingCalories / 4);

  // Water target: ~35-40ml per kg
  const waterTargetMl = Math.round(Math.max(2500, Math.min(4500, weightKg * 38)));

  return {
    calorieTarget,
    proteinTarget,
    carbsTarget,
    fatTarget,
    waterTargetMl,
  };
}
