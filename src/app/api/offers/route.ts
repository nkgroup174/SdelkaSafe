import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendTelegramMessage } from "@/lib/telegram";

const schema = z.object({
  listingId: z.string().uuid(),
  offeredPriceRub: z.number().positive(),
  quantity: z.number().int().positive().default(1),
  message: z.string().max(500).optional(),
});

// POST /api/offers — покупатель предлагает свою цену
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const { listingId, offeredPriceRub, quantity, message } = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { supplier: { select: { id: true, telegramId: true } } },
  });
  if (!listing || listing.status !== "APPROVED") {
    return NextResponse.json({ error: "Объявление недоступно" }, { status: 404 });
  }
  if (listing.supplierId === session.user.id) {
    return NextResponse.json({ error: "Нельзя торговаться по своему объявлению" }, { status: 400 });
  }

  const offer = await prisma.offer.create({
    data: {
      listingId,
      buyerId: session.user.id,
      sellerId: listing.supplierId,
      offeredPriceRub,
      quantity,
      message: message || null,
    },
  });

  if (listing.supplier.telegramId) {
    await sendTelegramMessage(
      listing.supplier.telegramId,
      `🤝 Новое предложение цены по «${listing.title}»: ${offeredPriceRub.toLocaleString("ru-RU")} ₽ × ${quantity}. Ответьте в кабинете → Предложения.`
    );
  }

  return NextResponse.json({ ok: true, offer }, { status: 201 });
}
