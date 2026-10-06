import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { onboardingSchema } from "@/lib/validation/schemas";
import { calculateMacroTargets } from "@/lib/nutrition/calculator";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const validated = onboardingSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const data = validated.data;

    // Calculate personalized macro and water targets based on user metrics
    const targets = calculateMacroTargets({
      weightKg: data.weight,
      heightCm: data.height,
      age: data.age,
      gender: data.gender,
      activityLevel: data.activityLevel,
      fitnessGoal: data.fitnessGoal,
    });

    // Update Profile
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
        fitnessGoal: data.fitnessGoal,
        experience: data.experience,
        trainingLocation: data.trainingLocation,
        onboarded: true,
      },
      create: {
        userId: user.id,
        age: data.age,
        gender: data.gender,
        height: data.height,
        weight: data.weight,
        targetWeight: data.targetWeight,
        activityLevel: data.activityLevel,
        fitnessGoal: data.fitnessGoal,
        experience: data.experience,
        trainingLocation: data.trainingLocation,
        onboarded: true,
      },
    });

    // Update or create FitnessPreference with calibrated targets
    await prisma.fitnessPreference.upsert({
      where: { userId: user.id },
      update: {
        equipment: JSON.stringify(data.equipment),
        daysPerWeek: data.daysPerWeek,
        sessionDurationMin: data.sessionDurationMin,
        dietaryPreference: data.dietaryPreference,
        allergies: data.allergies || "",
        calorieTarget: targets.calorieTarget,
        proteinTarget: targets.proteinTarget,
        carbsTarget: targets.carbsTarget,
        fatTarget: targets.fatTarget,
        waterTargetMl: targets.waterTargetMl,
      },
      create: {
        userId: user.id,
        equipment: JSON.stringify(data.equipment),
        daysPerWeek: data.daysPerWeek,
        sessionDurationMin: data.sessionDurationMin,
        dietaryPreference: data.dietaryPreference,
        allergies: data.allergies || "",
        calorieTarget: targets.calorieTarget,
        proteinTarget: targets.proteinTarget,
        carbsTarget: targets.carbsTarget,
        fatTarget: targets.fatTarget,
        waterTargetMl: targets.waterTargetMl,
      },
    });

    // Log initial weight entry
    await prisma.weightEntry.create({
      data: {
        userId: user.id,
        weightKg: data.weight,
        note: "Initial weight logged during onboarding",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Onboarding completed successfully!",
      targets,
    });
  } catch (err) {
    console.error("Onboarding submission error:", err);
    return NextResponse.json({ error: "Failed to save onboarding information" }, { status: 500 });
  }
}
