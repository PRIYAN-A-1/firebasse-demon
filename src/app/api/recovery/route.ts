import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { recoveryEntrySchema } from "@/lib/validation/schemas";
import { calculateRecoveryScore } from "@/lib/analytics/fitness-score";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const entries = await prisma.recoveryEntry.findMany({
      where: { userId: user.id },
      orderBy: { loggedAt: "desc" },
      take: 14,
    });

    const latest = entries[0] || null;

    return NextResponse.json({
      latest,
      history: entries,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch recovery data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const validated = recoveryEntrySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid recovery metrics" },
        { status: 400 }
      );
    }

    const { sleepHours, soreness, stress, energy, notes } = validated.data;
    const recoveryCalc = calculateRecoveryScore({ sleepHours, soreness, stress, energy });

    const entry = await prisma.recoveryEntry.create({
      data: {
        userId: user.id,
        sleepHours,
        soreness,
        stress,
        energy,
        calculatedScore: recoveryCalc.score,
        notes,
        loggedAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Recovery log recorded!",
      entry,
      score: recoveryCalc.score,
      status: recoveryCalc.status,
      explanation: recoveryCalc.explanation,
    });
  } catch (err) {
    console.error("Recovery log error:", err);
    return NextResponse.json({ error: "Failed to save recovery log" }, { status: 500 });
  }
}
