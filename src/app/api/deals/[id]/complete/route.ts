import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendTelegramMessage } from "@/lib/telegram";

// POST /api/deals/[id]/complete — покупатель подтверждает получение.
// Сделка закрывается, поставщику начисляется success-fee (списывается с его баланса).
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: { seller: { select: { telegramId: true } } },
  });
  if (!deal || deal.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 });
  }
  if (deal.status !== "PAID") {
    return NextResponse.json(
      { error: "Сделку можно завершить только после оплаты" },
      { status: 409 }
    );
  }

  // Атомарно: закрываем сделку, списываем комиссию с баланса поставщика, пишем проводку.
  await prisma.$transaction([
    prisma.deal.update({ where: { id }, data: { status: "COMPLETED" } }),
    prisma.user.update({
      where: { id: deal.sellerId },
      data: { balanceRub: { decrement: deal.commissionRub } },
    }),
    prisma.balanceTransaction.create({
      data: {
        userId: deal.sellerId,
        type: "COMMISSION",
        amountRub: -deal.commissionRub,
        dealId: deal.id,
        note: `Комиссия по сделке ${deal.orderNumber}`,
      },
    }),
  ]);

  // Уведомление поставщику о завершении сделки
  if (deal.seller.telegramId) {
    await sendTelegramMessage(
      deal.seller.telegramId,
      `✅ Сделка ${deal.orderNumber} завершена покупателем. Комиссия ${deal.commissionRub.toLocaleString("ru-RU")} ₽ списана с баланса.`
    );
  }

  return NextResponse.json({ ok: true, status: "COMPLETED" });
}
