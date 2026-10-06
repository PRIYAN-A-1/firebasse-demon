import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// This endpoint allows an external service to request real-time data transfer
// for a specific user. It requires a valid API_SECRET passed in the headers.
export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const expectedSecret = process.env.API_SECRET || "fittrack_export_secret_123";

    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized. Invalid or missing API secret." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "Missing userId parameter" }, { status: 400 });
    }

    // Fetch all real-time user data to transfer
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        fitnessPreference: true,
        subscription: true,
        workoutSessions: {
          orderBy: { startedAt: "desc" },
          take: 50,
          include: { sets: true }
        },
        meals: {
          orderBy: { consumedAt: "desc" },
          take: 50
        },
        weightEntries: {
          orderBy: { loggedAt: "desc" },
          take: 30
        },
        recoveryEntries: {
          orderBy: { loggedAt: "desc" },
          take: 14
        },
        goals: true
      },
    });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Strip sensitive info before transferring
    const { passwordHash, ...safeUserData } = userData;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: safeUserData,
    });
  } catch (error) {
    console.error("Real-time data transfer error:", error);
    return NextResponse.json({ error: "Failed to transfer data" }, { status: 500 });
  }
}
