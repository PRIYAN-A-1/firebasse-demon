import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { waterEntrySchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const entries = await prisma.waterEntry.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
      orderBy: { loggedAt: "desc" },
    });

    const totalTodayMl = entries.reduce((acc, e) => acc + e.amountMl, 0);
    const targetMl = user.fitnessPreference?.waterTargetMl || 3000;

    return NextResponse.json({
      entries,
      totalTodayMl,
      targetMl,
    });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch water data" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const validated = waterEntrySchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid water amount" },
        { status: 400 }
      );
    }

    const entry = await prisma.waterEntry.create({
      data: {
        userId: user.id,
        amountMl: validated.data.amountMl,
        loggedAt: new Date(),
      },
    });

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEntries = await prisma.waterEntry.findMany({
      where: {
        userId: user.id,
        loggedAt: { gte: todayStart },
      },
    });

    const totalTodayMl = todayEntries.reduce((acc, e) => acc + e.amountMl, 0);

    return NextResponse.json({
      success: true,
      message: `Added ${validated.data.amountMl} ml of water!`,
      entry,
      totalTodayMl,
      targetMl: user.fitnessPreference?.waterTargetMl || 3000,
    });
  } catch (err) {
    console.error("Water logging error:", err);
    return NextResponse.json({ error: "Failed to log water" }, { status: 500 });
  }
}
