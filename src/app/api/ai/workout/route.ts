import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";
import { aiWorkoutGeneratorSchema } from "@/lib/validation/schemas";
import { generateAIWorkout } from "@/lib/ai/workout-generator";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const validated = aiWorkoutGeneratorSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid input parameters" },
        { status: 400 }
      );
    }

    const routine = await generateAIWorkout(validated.data);

    return NextResponse.json({
      success: true,
      routine,
    });
  } catch (err) {
    console.error("AI workout error:", err);
    return NextResponse.json({ error: "Failed to generate workout routine" }, { status: 500 });
  }
}
