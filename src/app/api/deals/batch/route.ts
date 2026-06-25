import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getTonRateRub } from "@/lib/ton";
import { commissionRub } from "@/lib/constants";

const schema = z.object({
  items: z
    .array(z.object({ listingId: z.string().uuid(), quantity: z.number().int().positive() }))
    .min(1),
});

function orderNumber() {
  return (
    "SS-" +
    Date.now().toString(36).toUpperCase() +
    "-" +
    Math.random().toString(36).slice(2, 5).toUpperCase()
  );
}

// POST /api/deals/batch — создать сделки по позициям ОДНОГО поставщика (для оплаты одной транзакцией)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const ids = parsed.data.items.map((i) => i.listingId);
  const listings = await prisma.listing.findMany({
    where: { id: { in: ids }, status: "APPROVED" },
    include: { supplier: { select: { id: true, tonWallet: true } } },
  });
  if (listings.length !== ids.length) {
    return NextResponse.json({ error: "Некоторые объявления недоступны" }, { status: 400 });
  }
  const sellerId = listings[0].supplierId;
  if (!listings.every((l) => l.supplierId === sellerId)) {
    return NextResponse.json({ error: "Позиции должны быть от одного поставщика" }, { status: 400 });
  }
  if (sellerId === session.user.id) {
    return NextResponse.json({ error: "Нельзя купить своё объявление" }, { status: 400 });
  }
  const sellerWallet = listings[0].supplier.tonWallet;
  if (!sellerWallet) {
    return NextResponse.json({ error: "У поставщика не указан TON-кошелёк" }, { status: 400 });
  }

  // проверка наличия
  for (const it of parsed.data.items) {
    const l = listings.find((x) => x.id === it.listingId)!;
    if (l.type === "PRODUCT" && l.stock != null && l.stock < it.quantity) {
      return NextResponse.json({ error: `Недостаточно: ${l.title}` }, { status: 400 });
    }
  }

  const rate = await getTonRateRub();
  let totalRub = 0;
  const dealIds: string[] = [];

  for (const it of parsed.data.items) {
    const l = listings.find((x) => x.id === it.listingId)!;
    const amountRub = l.priceRub * it.quantity;
    totalRub += amountRub;
    const deal = await prisma.deal.create({
      data: {
        orderNumber: orderNumber(),
        listingId: l.id,
        buyerId: session.user.id,
        sellerId,
        quantity: it.quantity,
        amountRub,
        amountTon: Math.round((amountRub / rate) * 1e9) / 1e9,
        tonRate: rate,
        commissionRub: commissionRub(amountRub),
        status: "PENDING",
      },
    });
    dealIds.push(deal.id);
  }

  const totalTon = Math.round((totalRub / rate) * (1 + 0.01) * 1e9) / 1e9;

  return NextResponse.json({
    ok: true,
    dealIds,
    sellerWallet,
    totalRub,
    totalTon,
    rate,
  });
}
