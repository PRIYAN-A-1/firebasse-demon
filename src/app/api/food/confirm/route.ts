import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { calculateMealTotals } from "@/lib/nutrition/calculator";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const { mealType, items, scanId, notes } = body;

    if (!mealType || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Invalid payload. Meal type and items array are required." },
        { status: 400 }
      );
    }

    const totals = calculateMealTotals(items);

    // Create meal in database
    const meal = await prisma.meal.create({
      data: {
        userId: user.id,
        mealType: mealType.toLowerCase(),
        notes: notes || undefined,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        totalFiber: totals.fiber,
        items: {
          create: items.map((it: any) => ({
            foodId: it.foodId || undefined,
            foodName: it.foodName || it.name || it.detectedName || "Food Item",
            quantity: Number(it.quantity || it.estimatedQuantity || 100),
            unit: it.unit || it.estimatedUnit || "g",
            calories: Number(it.calories || 0),
            protein: Number(it.protein || 0),
            carbs: Number(it.carbs || 0),
            fat: Number(it.fat || 0),
            fiber: Number(it.fiber || 0),
          })),
        },
      },
      include: { items: true },
    });

    // If scanId was provided, update scan items to confirmed
    if (scanId) {
      await prisma.foodScanItem.updateMany({
        where: { scanId },
        data: { isConfirmed: true },
      });
    }

    return NextResponse.json({
      success: true,
      message: `Meal successfully added to ${mealType.toUpperCase()}!`,
      meal,
      totals,
    });
  } catch (err) {
    console.error("Food confirmation error:", err);
    return NextResponse.json({ error: "Failed to confirm and save meal" }, { status: 500 });
  }
}
