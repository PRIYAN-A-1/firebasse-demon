import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { requireAuth } from "@/lib/auth/session";
import { aiCoachMessageSchema } from "@/lib/validation/schemas";
import { askAICoach } from "@/lib/ai/coach-engine";

export async function POST(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const body = await req.json();
    const validated = aiCoachMessageSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || "Invalid message" },
        { status: 400 }
      );
    }

    const { message, conversationId } = validated.data;

    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.aIConversation.create({
        data: {
          userId: user.id,
          title: message.substring(0, 40) + "...",
        },
      });
      convId = conv.id;
    }

    // Save user message
    await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: "user",
        content: message,
      },
    });

    // Generate intelligent AI coach response
    const answer = await askAICoach({
      userId: user.id,
      userMessage: message,
    });

    // Save coach response
    const coachMessage = await prisma.aIMessage.create({
      data: {
        conversationId: convId,
        role: "assistant",
        content: answer,
      },
    });

    return NextResponse.json({
      success: true,
      conversationId: convId,
      answer,
      messageId: coachMessage.id,
    });
  } catch (err) {
    console.error("AI Coach error:", err);
    return NextResponse.json({ error: "Failed to consult AI Coach" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { user, error } = await requireAuth(req);
  if (error) return error;

  try {
    const conversations = await prisma.aIConversation.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      take: 10,
    });

    return NextResponse.json({ conversations });
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch conversations" }, { status: 500 });
  }
}
