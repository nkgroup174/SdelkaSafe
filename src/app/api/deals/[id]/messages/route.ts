import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendTelegramMessage } from "@/lib/telegram";

const schema = z.object({ text: z.string().min(1).max(2000) });

async function assertParticipant(dealId: string, userId: string) {
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    select: { buyerId: true, sellerId: true },
  });
  if (!deal) return null;
  if (deal.buyerId !== userId && deal.sellerId !== userId) return null;
  return deal;
}

// GET /api/deals/[id]/messages — история чата
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  if (!(await assertParticipant(id, session.user.id))) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const messages = await prisma.message.findMany({
    where: { dealId: id },
    orderBy: { createdAt: "asc" },
    select: { id: true, text: true, senderId: true, createdAt: true },
  });
  return NextResponse.json({ messages, me: session.user.id });
}

// POST /api/deals/[id]/messages — отправить сообщение
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const deal = await assertParticipant(id, session.user.id);
  if (!deal) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Пустое сообщение" }, { status: 400 });
  }

  const message = await prisma.message.create({
    data: { dealId: id, senderId: session.user.id, text: parsed.data.text },
    select: { id: true, text: true, senderId: true, createdAt: true },
  });

  // Уведомление второй стороне в Telegram (если привязан)
  const recipientId =
    deal.buyerId === session.user.id ? deal.sellerId : deal.buyerId;
  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: { telegramId: true },
  });
  if (recipient?.telegramId) {
    await sendTelegramMessage(
      recipient.telegramId,
      `💬 Новое сообщение по сделке:\n${parsed.data.text}`
    );
  }

  return NextResponse.json({ ok: true, message }, { status: 201 });
}
