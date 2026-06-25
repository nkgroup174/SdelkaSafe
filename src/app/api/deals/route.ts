import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { rubToTon } from "@/lib/ton";
import { commissionRub } from "@/lib/constants";
import { sendTelegramMessage } from "@/lib/telegram";
import { checkPromo } from "@/lib/promo";

const schema = z.object({
  listingId: z.string().uuid(),
  quantity: z.number().int().positive().default(1),
  promoCode: z.string().optional(),
});

function orderNumber() {
  return "SS-" + Date.now().toString(36).toUpperCase() + "-" +
    Math.random().toString(36).slice(2, 5).toUpperCase();
}

// POST /api/deals — создать сделку (заказчик)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const { listingId, quantity, promoCode } = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { supplier: { select: { id: true, tonWallet: true, telegramId: true } } },
  });
  if (!listing || listing.status !== "APPROVED") {
    return NextResponse.json({ error: "Объявление недоступно" }, { status: 404 });
  }
  if (listing.supplierId === session.user.id) {
    return NextResponse.json(
      { error: "Нельзя купить собственное объявление" },
      { status: 400 }
    );
  }
  // Проверка наличия для товаров
  if (listing.type === "PRODUCT" && listing.stock != null) {
    if (listing.stock <= 0) {
      return NextResponse.json({ error: "Товара нет в наличии" }, { status: 400 });
    }
    if (quantity > listing.stock) {
      return NextResponse.json(
        { error: `Доступно только ${listing.stock} шт.` },
        { status: 400 }
      );
    }
  }

  const baseAmount = listing.priceRub * quantity;

  // Промокод (если передан и валиден)
  let discountRub = 0;
  let promoCodeId: string | null = null;
  if (promoCode) {
    const check = await checkPromo(promoCode, baseAmount);
    if (check.valid) {
      discountRub = check.discountRub;
      promoCodeId = check.promoId;
    }
  }

  const amountRub = Math.max(0, baseAmount - discountRub);
  const { ton, rate } = await rubToTon(amountRub);

  const deal = await prisma.deal.create({
    data: {
      orderNumber: orderNumber(),
      listingId: listing.id,
      buyerId: session.user.id,
      sellerId: listing.supplierId,
      quantity,
      amountRub,
      amountTon: ton,
      tonRate: rate,
      commissionRub: commissionRub(amountRub),
      discountRub,
      promoCodeId,
      status: "PENDING",
    },
  });

  // Учитываем использование промокода
  if (promoCodeId) {
    await prisma.promoCode.update({
      where: { id: promoCodeId },
      data: { usedCount: { increment: 1 } },
    });
  }

  // Уведомление поставщику в Telegram (если привязан)
  if (listing.supplier.telegramId) {
    await sendTelegramMessage(
      listing.supplier.telegramId,
      `🆕 Новая заявка по «${listing.title}»\n` +
        `Сумма: ${amountRub.toLocaleString("ru-RU")} ₽ · Заказ ${deal.orderNumber}`
    );
  }

  return NextResponse.json(
    {
      ok: true,
      deal: {
        id: deal.id,
        orderNumber: deal.orderNumber,
        amountRub: deal.amountRub,
        amountTon: deal.amountTon,
        tonRate: deal.tonRate,
        sellerWallet: listing.supplier.tonWallet, // куда платить (не-кастодиально)
      },
    },
    { status: 201 }
  );
}
