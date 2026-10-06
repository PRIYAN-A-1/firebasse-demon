import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { calculateMealTotals } from "@/lib/nutrition/calculator";
import { saveMealSchema } from "@/lib/validation/schemas";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const date = dateParam ? new Date(dateParam) : new Date();
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const meals = await prisma.meal.findMany({
      where: {
        userId: user.id,
        consumedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: { items: true },
      orderBy: { consumedAt: "asc" },
    });

    const dayTotals = meals.reduce(
      (acc, m) => ({
        calories: Math.round((acc.calories + m.totalCalories) * 10) / 10,
        protein: Math.round((acc.protein + m.totalProtein) * 10) / 10,
        carbs: Math.round((acc.carbs + m.totalCarbs) * 10) / 10,
        fat: Math.round((acc.fat + m.totalFat) * 10) / 10,
        fiber: Math.round((acc.fiber + m.totalFiber) * 10) / 10,
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );

    return NextResponse.json({
      date: startOfDay.toISOString(),
      meals,
      dayTotals,
    });
  } catch (err) {
    console.error("Fetch meals error:", err);
    return NextResponse.json({ error: "Failed to fetch meals" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const validated = saveMealSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { mealType, items, notes, consumedAt } = validated.data;
    const totals = calculateMealTotals(items);

    const meal = await prisma.meal.create({
      data: {
        userId: user.id,
        mealType,
        notes,
        consumedAt: consumedAt ? new Date(consumedAt) : new Date(),
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber,
        items: {
          create: items.map((it) => ({
            foodId: it.foodId || undefined,
            foodName: it.foodName,
            quantity: it.quantity,
            unit: it.unit,
            calories: it.calories,
            protein: it.protein,
            carbs: it.carbs,
            fat: it.fat,
            fiber: it.fiber,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      message: `Meal saved successfully!`,
      meal,
      totals,
    });
  } catch (err) {
    console.error("Save meal error:", err);
    return NextResponse.json({ error: "Failed to save meal" }, { status: 500 });
  }
}
