import { NextRequest, NextResponse } from "next/server";
import { getSession, verifySessionToken, COOKIE_NAME, SessionPayload } from "./jwt";
import { prisma } from "../db/prisma";

export async function requireAuth(req?: NextRequest): Promise<
  | { user: { id: string; email: string; name: string; profile: any; fitnessPreference: any; subscription: any }; error: null }
  | { user: null; error: NextResponse }
> {
  let session: SessionPayload | null = null;

  if (req) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    if (token) {
      session = await verifySessionToken(token);
    }
  } else {
    session = await getSession();
  }

  if (!session) {
    return {
      user: null,
      error: NextResponse.json({ error: "Unauthorized. Please sign in." }, { status: 401 }),
    };
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      profile: true,
      fitnessPreference: true,
      subscription: true,
    },
  });

  if (!dbUser) {
    return {
      user: null,
      error: NextResponse.json({ error: "User account not found." }, { status: 401 }),
    };
  }

  return {
    user: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      profile: dbUser.profile,
      fitnessPreference: dbUser.fitnessPreference,
      subscription: dbUser.subscription,
    },
    error: null,
  };
}
