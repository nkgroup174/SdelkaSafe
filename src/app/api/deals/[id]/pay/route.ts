import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendTelegramMessage } from "@/lib/telegram";

const schema = z.object({ txHash: z.string().min(1) });

// POST /api/deals/[id]/pay — покупатель отправил оплату в TON напрямую поставщику,
// фиксируем транзакцию. Платформа деньги не получает (не-кастодиально).
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
    return NextResponse.json({ error: "Нет txHash" }, { status: 400 });
  }

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      listing: { select: { title: true, type: true } },
      seller: { select: { telegramId: true } },
    },
  });
  if (!deal || deal.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 });
  }
  if (deal.status !== "PENDING") {
    return NextResponse.json({ error: "Сделка уже оплачена" }, { status: 409 });
  }

  const updated = await prisma.deal.update({
    where: { id },
    data: { status: "PAID", txHash: parsed.data.txHash },
  });

  // Списываем остаток товара
  if (deal.listing.type === "PRODUCT") {
    await prisma.listing.update({
      where: { id: deal.listingId },
      data: { stock: { decrement: deal.quantity } },
    });
  }

  // Уведомление поставщику об оплате
  if (deal.seller.telegramId) {
    await sendTelegramMessage(
      deal.seller.telegramId,
      `💰 Сделка ${deal.orderNumber} оплачена — «${deal.listing.title}». Можно приступать к выполнению.`
    );
  }

  return NextResponse.json({ ok: true, status: updated.status });
}
