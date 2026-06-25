import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendTelegramMessage } from "@/lib/telegram";

const schema = z.object({
  dealIds: z.array(z.string().uuid()).min(1),
  txHash: z.string().min(1),
});

// POST /api/deals/batch/pay — отметить пакет сделок оплаченными одной транзакцией
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const deals = await prisma.deal.findMany({
    where: { id: { in: parsed.data.dealIds }, buyerId: session.user.id, status: "PENDING" },
    include: { listing: { select: { type: true } }, seller: { select: { telegramId: true } } },
  });
  if (deals.length === 0) {
    return NextResponse.json({ error: "Сделки не найдены" }, { status: 404 });
  }

  for (const deal of deals) {
    await prisma.deal.update({
      where: { id: deal.id },
      data: { status: "PAID", txHash: parsed.data.txHash },
    });
    if (deal.listing.type === "PRODUCT") {
      await prisma.listing.update({
        where: { id: deal.listingId },
        data: { stock: { decrement: deal.quantity } },
      });
    }
  }

  // одно уведомление поставщику
  const sellerTg = deals[0].seller.telegramId;
  if (sellerTg) {
    await sendTelegramMessage(
      sellerTg,
      `💰 Оплачен заказ из ${deals.length} позиц. на сумму ${deals
        .reduce((s, d) => s + d.amountRub, 0)
        .toLocaleString("ru-RU")} ₽.`
    );
  }

  return NextResponse.json({ ok: true, paid: deals.length });
}
