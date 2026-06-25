import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const createSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3).max(1000),
});
const replySchema = z.object({ reply: z.string().min(1).max(1000) });

// POST /api/deals/[id]/review — покупатель оставляет отзыв (после COMPLETED)
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal || deal.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 });
  }
  if (deal.status !== "COMPLETED") {
    return NextResponse.json(
      { error: "Отзыв можно оставить после завершения сделки" },
      { status: 409 }
    );
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректный отзыв" }, { status: 400 });
  }

  const review = await prisma.review.upsert({
    where: { dealId: id },
    update: { rating: parsed.data.rating, comment: parsed.data.comment },
    create: {
      dealId: id,
      authorId: session.user.id,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });
  return NextResponse.json({ ok: true, review });
}

// PATCH /api/deals/[id]/review — ответ поставщика на отзыв
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal || deal.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const parsed = replySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Пустой ответ" }, { status: 400 });
  }

  const review = await prisma.review.update({
    where: { dealId: id },
    data: { reply: parsed.data.reply },
  });
  return NextResponse.json({ ok: true, review });
}
