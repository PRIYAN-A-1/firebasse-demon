import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim().toLowerCase();
    const category = searchParams.get("category");

    const whereClause: any = {};
    if (category && category !== "All") {
      whereClause.category = category;
    }

    if (q) {
      whereClause.OR = [
        { name: { contains: q } },
        { canonicalName: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const foods = await prisma.food.findMany({
      where: whereClause,
      include: { nutrition: true },
      take: 30,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ foods });
  } catch (err) {
    console.error("Food search error:", err);
    return NextResponse.json({ error: "Failed to search foods" }, { status: 500 });
  }
}
