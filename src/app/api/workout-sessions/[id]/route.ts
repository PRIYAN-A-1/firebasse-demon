import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: params.id },
      include: {
        sets: {
          orderBy: { setNumber: "asc" },
        },
      },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({ session });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const session = await prisma.workoutSession.findUnique({
      where: { id: params.id },
      include: { sets: true },
    });

    if (!session || session.userId !== user.id) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const body = await req.json();
    const durationSeconds = body.durationSeconds || session.durationSeconds || 1800;
    const notes = body.notes || session.notes;

    // Calculate estimated calories burned based on duration & sets (~5-7 kcal/min during lifting)
    const estimatedCalories = Math.round((durationSeconds / 60) * 6.5);

    // Identify PRs achieved in this session
    const prSets = session.sets.filter((s) => s.isPr && s.isCompleted);
    const prSummary = prSets.map((s) => `${s.exerciseName}: ${s.weightKg} kg`);

    const updated = await prisma.workoutSession.update({
      where: { id: params.id },
      data: {
        status: "completed",
        completedAt: new Date(),
        durationSeconds,
        notes,
        estimatedCalories,
        prsAchieved: JSON.stringify(prSummary),
      },
      include: { sets: true },
    });

    return NextResponse.json({
      success: true,
      message: "Workout Completed!",
      session: updated,
      summary: {
        durationSeconds,
        totalSets: updated.totalSets,
        totalReps: updated.totalReps,
        totalVolumeKg: updated.totalVolumeKg,
        estimatedCalories,
        prs: prSummary,
      },
    });
  } catch (err) {
    console.error("Complete workout error:", err);
    return NextResponse.json({ error: "Failed to complete workout" }, { status: 500 });
  }
}
