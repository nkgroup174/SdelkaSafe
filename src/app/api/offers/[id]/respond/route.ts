import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { rubToTon } from "@/lib/ton";
import { commissionRub } from "@/lib/constants";
import { sendTelegramMessage } from "@/lib/telegram";

const schema = z.object({ action: z.enum(["accept", "decline"]) });

function orderNumber() {
  return (
    "SS-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

// POST /api/offers/[id]/respond — поставщик принимает/отклоняет предложение
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const offer = await prisma.offer.findUnique({
    where: { id },
    include: {
      listing: { select: { id: true, title: true, type: true, stock: true } },
      buyer: { select: { telegramId: true } },
    },
  });
  if (!offer || offer.sellerId !== session.user.id) {
    return NextResponse.json({ error: "Предложение не найдено" }, { status: 404 });
  }
  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Предложение уже обработано" }, { status: 409 });
  }

  if (parsed.data.action === "decline") {
    await prisma.offer.update({ where: { id }, data: { status: "DECLINED" } });
    if (offer.buyer.telegramId) {
      await sendTelegramMessage(
        offer.buyer.telegramId,
        `❌ Предложение по «${offer.listing.title}» отклонено.`
      );
    }
    return NextResponse.json({ ok: true, status: "DECLINED" });
  }

  // accept → проверяем наличие и создаём сделку по согласованной цене
  if (
    offer.listing.type === "PRODUCT" &&
    offer.listing.stock != null &&
    offer.listing.stock < offer.quantity
  ) {
    return NextResponse.json({ error: "Недостаточно товара в наличии" }, { status: 400 });
  }

  const amountRub = offer.offeredPriceRub * offer.quantity;
  const { ton, rate } = await rubToTon(amountRub);

  const deal = await prisma.deal.create({
    data: {
      orderNumber: orderNumber(),
      listingId: offer.listingId,
      buyerId: offer.buyerId,
      sellerId: offer.sellerId,
      quantity: offer.quantity,
      amountRub,
      amountTon: ton,
      tonRate: rate,
      commissionRub: commissionRub(amountRub),
      status: "PENDING",
    },
  });

  await prisma.offer.update({
    where: { id },
    data: { status: "ACCEPTED", dealId: deal.id },
  });

  if (offer.buyer.telegramId) {
    await sendTelegramMessage(
      offer.buyer.telegramId,
      `✅ Ваша цена по «${offer.listing.title}» принята! Создана сделка ${deal.orderNumber} на ${amountRub.toLocaleString("ru-RU")} ₽ — оплатите в кабинете.`
    );
  }

  return NextResponse.json({ ok: true, status: "ACCEPTED", dealId: deal.id });
}
