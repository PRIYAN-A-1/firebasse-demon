import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { workoutSetSchema } from "@/lib/validation/schemas";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: params.id },
    });

    if (!session) {
      return NextResponse.json({ error: "Workout session not found" }, { status: 404 });
    }

    if (session.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden: Not your session" }, { status: 403 });
    }

    const body = await req.json();
    const validated = workoutSetSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid set data" },
        { status: 400 }
      );
    }

    const { exerciseName, setNumber, weightKg, reps, rpe, isCompleted } = validated.data;

    // Check PR against actual past history for this user (Section 28)
    const pastCompletedSets = await prisma.workoutSet.findMany({
      where: {
        session: { userId: user.id, status: "completed" },
        exerciseName: { equals: exerciseName },
        isCompleted: true,
      },
      orderBy: { weightKg: "desc" },
      take: 1,
    });

    const previousMaxWeight = pastCompletedSets.length > 0 ? pastCompletedSets[0].weightKg : 0;
    const isPr = weightKg > 0 && weightKg > previousMaxWeight;

    // Create the set
    const workoutSet = await prisma.workoutSet.create({
      data: {
        sessionId: session.id,
        exerciseName,
        setNumber,
        weightKg,
        reps,
        rpe,
        isCompleted,
        isPr,
      },
    });

    // Recalculate session running volume & sets
    const allSets = await prisma.workoutSet.findMany({
      where: { sessionId: session.id, isCompleted: true },
    });

    const totalVolume = allSets.reduce((acc, s) => acc + s.weightKg * s.reps, 0);
    const totalReps = allSets.reduce((acc, s) => acc + s.reps, 0);

    await prisma.workoutSession.update({
      where: { id: session.id },
      data: {
        totalVolumeKg: totalVolume,
        totalSets: allSets.length,
        totalReps: totalReps,
      },
    });

    return NextResponse.json({
      success: true,
      set: workoutSet,
      sessionStats: {
        totalVolumeKg: totalVolume,
        totalSets: allSets.length,
        totalReps: totalReps,
      },
      isPr,
      previousMaxWeight,
    });
  } catch (err) {
    console.error("Save workout set error:", err);
    return NextResponse.json({ error: "Failed to save workout set" }, { status: 500 });
  }
}
