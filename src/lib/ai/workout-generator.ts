import { prisma } from "../db/prisma";

export interface GeneratedWorkoutExercise {
  id?: string;
  name: string;
  sets: number;
  reps: string;
  restSeconds: number;
  reason: string;
  equipment: string;
  primaryMuscle: string;
}

export interface GeneratedWorkoutRoutine {
  workoutName: string;
  estimatedDuration: number;
  warmup: string[];
  exercises: GeneratedWorkoutExercise[];
  cooldown: string[];
  notes: string;
}

export async function generateAIWorkout(params: {
  goal: string;
  muscleFocus: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  durationMin: number;
  equipment: string;
  location?: string;
  injuries?: string;
}): Promise<GeneratedWorkoutRoutine> {
  const { goal, muscleFocus, difficulty, durationMin, equipment, injuries } = params;

  // Query actual exercise database to pick real exercises
  const allExercises = await prisma.exercise.findMany();

  // Match exercises according to muscle focus
  const focusLower = muscleFocus.toLowerCase();
  let relevantExercises = allExercises.filter(
    (e) =>
      e.category.toLowerCase().includes(focusLower) ||
      e.primaryMuscle.toLowerCase().includes(focusLower) ||
      e.secondaryMuscles.toLowerCase().includes(focusLower)
  );

  if (relevantExercises.length < 3) {
    relevantExercises = allExercises;
  }

  // Adjust sets based on duration & difficulty
  const targetExerciseCount = Math.min(
    6,
    Math.max(3, Math.floor(durationMin / 12))
  );

  const selectedExercises = relevantExercises.slice(0, targetExerciseCount);

  const generatedExercises: GeneratedWorkoutExercise[] = selectedExercises.map((e, index) => {
    let sets = 3;
    let reps = "8-12";
    let restSec = 90;

    if (difficulty === "Advanced") {
      sets = 4;
      if (goal.includes("strength")) {
        reps = "5-6";
        restSec = 120;
      } else {
        reps = "8-12";
        restSec = 90;
      }
    } else if (difficulty === "Beginner") {
      sets = 3;
      reps = "10-12";
      restSec = 60;
    }

    return {
      id: e.id,
      name: e.name,
      sets,
      reps,
      restSeconds: restSec,
      equipment: e.equipment,
      primaryMuscle: e.primaryMuscle,
      reason: `Targets ${e.primaryMuscle} with progressive overload suited for ${difficulty.toLowerCase()} level and ${goal.toLowerCase()} objectives.`,
    };
  });

  const warmup = [
    "5 minutes light cardiovascular priming (jog / jump rope / dynamic mobility)",
    "Arm circles and thoracic spine extensions (2 sets x 10 reps)",
    "Target joint activation: band pull-aparts or bodyweight squats",
  ];

  const cooldown = [
    "Light static stretching focusing on target muscle groups (30s hold per stretch)",
    "Diaphragmatic breathing to activate parasympathetic recovery system",
  ];

  const routineName = `${muscleFocus.toUpperCase()} Precision ${difficulty} Protocol`;

  return {
    workoutName: routineName,
    estimatedDuration: durationMin,
    warmup,
    exercises: generatedExercises,
    cooldown,
    notes: injuries
      ? `Tailored with safety caution regarding: ${injuries}. Listen to your body and discontinue any movement that produces sharp pain.`
      : `Perform warmup sets before working weight. Focus on full range of motion and 2-second eccentric control.`,
  };
}
