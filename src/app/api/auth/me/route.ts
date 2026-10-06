import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth/session";

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      fitnessPreference: user.fitnessPreference,
      subscription: user.subscription,
    },
  });
}
