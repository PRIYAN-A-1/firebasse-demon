import { z } from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const onboardingSchema = z.object({
  age: z.number().int().min(12).max(100),
  gender: z.enum(["male", "female", "other"]),
  height: z.number().positive().min(50).max(250), // in cm
  weight: z.number().positive().min(30).max(300), // in kg
  targetWeight: z.number().positive().min(30).max(300).optional(),
  activityLevel: z.enum([
    "sedentary",
    "lightly_active",
    "moderately_active",
    "very_active",
  ]),
  fitnessGoal: z.enum([
    "lose_weight",
    "build_muscle",
    "gain_strength",
    "improve_endurance",
    "body_recomp",
    "maintain",
  ]),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  trainingLocation: z.enum(["gym", "home", "outdoor", "mixed"]),
  equipment: z.array(z.string()).min(1, "Select at least one equipment option"),
  daysPerWeek: z.number().int().min(1).max(7),
  sessionDurationMin: z.number().int().min(15).max(180),
  dietaryPreference: z.enum(["vegetarian", "vegan", "eggetarian", "non_veg"]),
  allergies: z.string().optional(),
});

export const workoutSetSchema = z.object({
  exerciseName: z.string().min(1),
  setNumber: z.number().int().min(1),
  weightKg: z.number().min(0, "Weight cannot be negative"),
  reps: z.number().int().min(0, "Reps cannot be negative"),
  rpe: z.number().min(1).max(10).optional(),
  isCompleted: z.boolean().default(true),
});

export const workoutSessionFinishSchema = z.object({
  durationSeconds: z.number().int().min(0),
  notes: z.string().optional(),
});

export const mealItemSchema = z.object({
  foodId: z.string().optional(),
  foodName: z.string().min(1),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unit: z.string().default("g"),
  calories: z.number().min(0),
  protein: z.number().min(0),
  carbs: z.number().min(0),
  fat: z.number().min(0),
  fiber: z.number().min(0).default(0),
});

export const saveMealSchema = z.object({
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
  consumedAt: z.string().optional(),
  imagePath: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(mealItemSchema).min(1, "At least one food item is required"),
});

export const waterEntrySchema = z.object({
  amountMl: z.number().int().positive().max(5000, "Maximum 5,000 ml at a time"),
});

export const weightEntrySchema = z.object({
  weightKg: z.number().positive().min(30).max(350),
  loggedAt: z.string().optional(),
  note: z.string().max(250).optional(),
});

export const recoveryEntrySchema = z.object({
  sleepHours: z.number().min(0).max(24),
  soreness: z.number().int().min(1).max(5),
  stress: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  notes: z.string().max(250).optional(),
});

export const fitnessGoalSchema = z.object({
  title: z.string().min(3).max(100),
  type: z.enum([
    "weight",
    "workouts_per_week",
    "calories",
    "protein",
    "hydration",
    "strength",
  ]),
  targetValue: z.number().positive(),
  currentValue: z.number().min(0).default(0),
  unit: z.string(),
  deadline: z.string().optional(),
});

export const aiWorkoutGeneratorSchema = z.object({
  goal: z.string().min(1),
  muscleFocus: z.string().min(1),
  difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
  durationMin: z.number().int().min(15).max(120),
  equipment: z.string().min(1),
  location: z.string().default("gym"),
  injuries: z.string().optional(),
});

export const aiCoachMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000),
  conversationId: z.string().optional(),
});
