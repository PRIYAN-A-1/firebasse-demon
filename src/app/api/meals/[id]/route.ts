import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const meal = await prisma.meal.findUnique({
      where: { id: params.id },
    });

    if (!meal) {
      return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    // Ownership check (Section 99 & 100)
    if (meal.userId !== user.id) {
      return NextResponse.json({ error: "Forbidden: You do not own this meal" }, { status: 403 });
    }

    await prisma.meal.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Meal deleted successfully" });
  } catch (err) {
    console.error("Delete meal error:", err);
    return NextResponse.json({ error: "Failed to delete meal" }, { status: 500 });
  }
}
