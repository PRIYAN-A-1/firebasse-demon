import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const sessions = await prisma.workoutSession.findMany({
      where: { userId: user.id },
      include: {
        sets: {
          orderBy: { setNumber: "asc" },
        },
      },
      orderBy: { startedAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ sessions });
  } catch (err) {
    console.error("Workout sessions error:", err);
    return NextResponse.json({ error: "Failed to fetch workout sessions" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const title = body.title || "Custom Workout Session";
    const planId = body.planId || undefined;

    const session = await prisma.workoutSession.create({
      data: {
        userId: user.id,
        title,
        planId,
        status: "in_progress",
        startedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, session });
  } catch (err) {
    console.error("Start workout session error:", err);
    return NextResponse.json({ error: "Failed to start workout session" }, { status: 500 });
  }
}
