import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const equipment = searchParams.get("equipment");
    const difficulty = searchParams.get("difficulty");
    const q = (searchParams.get("q") || "").trim().toLowerCase();

    const whereClause: any = {};

    if (category && category !== "All") {
      whereClause.category = category;
    }
    if (equipment && equipment !== "All") {
      whereClause.equipment = equipment;
    }
    if (difficulty && difficulty !== "All") {
      whereClause.difficulty = difficulty;
    }
    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { primaryMuscle: { contains: q } },
        { secondaryMuscles: { contains: q } },
      ];
    }

    const exercises = await prisma.exercise.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ exercises });
  } catch (err) {
    console.error("Exercises fetch error:", err);
    return NextResponse.json({ error: "Failed to fetch exercises" }, { status: 500 });
  }
}
