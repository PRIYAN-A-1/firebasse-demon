import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const goals = await prisma.fitnessGoal.findMany({
      where: { userId: user!.id },
      orderBy: { createdAt: "desc" },
    });

    const mapped = goals.map((g) => ({
      id: g.id,
      type: g.type,
      targetValue: g.targetValue,
      currentValue: g.currentValue,
      unit: g.unit,
      deadline: g.deadline?.toISOString() || null,
      notes: (g as any).notes || null,
      achieved: g.completed,
      createdAt: g.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data: mapped });
  } catch (err) {
    console.error("Goals GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch goals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { type, targetValue, currentValue = 0, unit, notes, deadline } = body;

    if (!type || targetValue === undefined) {
      return NextResponse.json({ success: false, error: "type and targetValue are required" }, { status: 400 });
    }

    const goal = await prisma.fitnessGoal.create({
      data: {
        userId: user!.id,
        title: type,
        type,
        targetValue: parseFloat(targetValue),
        currentValue: parseFloat(currentValue) || 0,
        unit: unit || "units",
        deadline: deadline ? new Date(deadline) : undefined,
        achieved: false,
      } as any,
    });

    return NextResponse.json({ success: true, data: goal });
  } catch (err) {
    console.error("Goals POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to create goal" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { id, currentValue } = body;

    if (!id || currentValue === undefined) {
      return NextResponse.json({ success: false, error: "id and currentValue required" }, { status: 400 });
    }

    // Find goal to check ownership and targetValue
    const goal = await prisma.fitnessGoal.findFirst({
      where: { id, userId: user!.id },
    });

    if (!goal) {
      return NextResponse.json({ success: false, error: "Goal not found" }, { status: 404 });
    }

    const newValue = parseFloat(currentValue);
    const achieved = newValue >= goal.targetValue;

    const updated = await prisma.fitnessGoal.update({
      where: { id },
      data: {
        currentValue: newValue,
        completed: achieved,
        achievedAt: achieved && !goal.completed ? new Date() : undefined,
      } as any,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error("Goals PATCH error:", err);
    return NextResponse.json({ success: false, error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Goal id required" }, { status: 400 });
    }

    await prisma.fitnessGoal.deleteMany({
      where: { id, userId: user!.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Goals DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete goal" }, { status: 500 });
  }
}
