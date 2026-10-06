import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const entries = await prisma.weightEntry.findMany({
      where: { userId: user!.id },
      orderBy: { loggedAt: "desc" },
    });

    const weights = entries.map((e) => ({
      id: e.id,
      weight: e.weightKg,
      bodyFat: (e as any).bodyFat || null,
      muscleMass: (e as any).muscleMass || null,
      notes: e.note || null,
      createdAt: e.loggedAt.toISOString(),
    }));

    const current = weights.length > 0 ? weights[0].weight : null;
    const start = weights.length > 0 ? weights[weights.length - 1].weight : null;
    const change = current && start ? Math.round((current - start) * 10) / 10 : 0;
    const min = weights.length > 0 ? Math.min(...weights.map((e) => e.weight)) : null;
    const max = weights.length > 0 ? Math.max(...weights.map((e) => e.weight)) : null;

    return NextResponse.json({
      success: true,
      data: {
        current,
        start,
        min,
        max,
        change,
        entries: weights,
      },
    });
  } catch (err) {
    console.error("Weight GET error:", err);
    return NextResponse.json({ success: false, error: "Failed to fetch weight data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { weight, bodyFat, muscleMass, notes } = body;

    if (!weight || isNaN(parseFloat(weight))) {
      return NextResponse.json({ success: false, error: "Valid weight is required" }, { status: 400 });
    }

    const entry = await prisma.weightEntry.create({
      data: {
        userId: user!.id,
        weightKg: parseFloat(weight),
        note: notes || null,
        loggedAt: new Date(),
      } as any,
    });

    // Update profile weight
    try {
      await prisma.profile.update({
        where: { userId: user!.id },
        data: { weight: parseFloat(weight) },
      });
    } catch {
      // profile might not exist yet
    }

    return NextResponse.json({
      success: true,
      data: {
        id: entry.id,
        weight: entry.weightKg,
        notes: entry.note,
        createdAt: entry.loggedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("Weight POST error:", err);
    return NextResponse.json({ success: false, error: "Failed to log weight" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Entry id required" }, { status: 400 });
    }

    await prisma.weightEntry.deleteMany({
      where: { id, userId: user!.id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Weight DELETE error:", err);
    return NextResponse.json({ success: false, error: "Failed to delete entry" }, { status: 500 });
  }
}
