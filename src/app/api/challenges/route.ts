import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const challenges = await prisma.challenge.findMany({
      include: {
        participants: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = challenges.map((c) => {
      const userParticipant = c.participants.find((p) => p.userId === user!.id);
      return {
        id: c.id,
        title: c.title,
        description: c.description,
        type: (c as any).type || c.category || "general",
        targetValue: c.targetValue,
        unit: (c as any).unit || c.metric || "units",
        durationDays: (c as any).durationDays || 30,
        difficulty: (c as any).difficulty || "intermediate",
        badgeEmoji: (c as any).badgeEmoji || c.badgeIcon || "🏆",
        participants: c.participants.length,
        userProgress: userParticipant
          ? {
              id: userParticipant.id,
              currentValue: userParticipant.progress || 0,
              completed: userParticipant.completed || false,
              joinedAt: userParticipant.joinedAt?.toISOString() || new Date().toISOString(),
            }
          : null,
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (err) {
    console.error("Challenges GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch challenges" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { challengeId } = body;

    if (!challengeId) {
      return NextResponse.json({ success: false, error: "challengeId is required" }, { status: 400 });
    }

    // Check if already joined
    const existing = await prisma.challengeParticipant.findFirst({
      where: { challengeId, userId: user!.id },
    });

    if (existing) {
      return NextResponse.json({ success: false, error: "Already joined this challenge" }, { status: 400 });
    }

    const participant = await prisma.challengeParticipant.create({
      data: {
        challengeId,
        userId: user!.id,
        progress: 0,
        completed: false,
      } as any,
    });

    return NextResponse.json({ success: true, data: participant });
  } catch (err) {
    console.error("Challenges POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to join challenge" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { progressId, currentValue } = body;

    if (!progressId || currentValue === undefined) {
      return NextResponse.json({ success: false, error: "progressId and currentValue required" }, { status: 400 });
    }

    // Verify ownership
    const participant = await prisma.challengeParticipant.findFirst({
      where: { id: progressId, userId: user!.id },
      include: { challenge: true },
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Progress record not found" }, { status: 404 });
    }

    const newValue = parseFloat(currentValue);
    const completed = newValue >= participant.challenge.targetValue;

    const updated = await prisma.challengeParticipant.update({
      where: { id: progressId },
      data: {
        progress: newValue,
        completed,
        completedAt: completed && !participant.completed ? new Date() : undefined,
      } as any,
    });

    return NextResponse.json({ success: true, data: { ...updated, completed } });
  } catch (err) {
    console.error("Challenges PATCH error:", err);
    return NextResponse.json({ success: false, error: "Failed to update progress" }, { status: 500 });
  }
}
