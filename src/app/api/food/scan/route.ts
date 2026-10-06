import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { analyzeFoodImage } from "@/lib/ai/food-vision";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const base64Data = formData.get("image") as string | null;

    let imageContent = "";
    let fileName = "meal-photo.jpg";

    if (file) {
      // Validate MIME type
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: "Invalid image format. Supported formats: JPG, PNG, WEBP" },
          { status: 400 }
        );
      }
      // Validate file size (< 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json(
          { error: "File size exceeds 10MB limit." },
          { status: 400 }
        );
      }
      const buffer = await file.arrayBuffer();
      imageContent = Buffer.from(buffer).toString("base64");
      fileName = file.name;
    } else if (base64Data) {
      imageContent = base64Data;
    } else {
      return NextResponse.json({ error: "No image file provided." }, { status: 400 });
    }

    // Run AI Vision Analysis
    const analysis = await analyzeFoodImage(imageContent, fileName);

    // Save FoodScan record in database
    const foodScan = await prisma.foodScan.create({
      data: {
        userId: user.id,
        imagePath: `/uploads/scans/${Date.now()}_scan.jpg`,
        status: "completed",
        detectedMealName: analysis.mealName,
        items: {
          create: analysis.items.map((item) => ({
            detectedName: item.detectedName,
            confidence: item.confidence,
            estimatedQuantity: item.estimatedQuantity,
            estimatedUnit: item.estimatedUnit,
            matchedFoodId: item.matchedFoodId,
            confirmedQuantity: item.estimatedQuantity,
            confirmedUnit: item.estimatedUnit,
            isConfirmed: false,
          })),
        },
      },
      include: { items: true },
    });

    return NextResponse.json({
      scanId: foodScan.id,
      mealName: analysis.mealName,
      items: analysis.items,
    });
  } catch (err) {
    console.error("Food scan error:", err);
    return NextResponse.json({ error: "Failed to process food image scan" }, { status: 500 });
  }
}
