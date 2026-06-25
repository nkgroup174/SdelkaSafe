import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/deals/[id]/cancel — отменить неоплаченную сделку (покупатель или поставщик)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal || (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id)) {
    return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 });
  }
  if (deal.status !== "PENDING") {
    return NextResponse.json(
      { error: "Отменить можно только неоплаченную сделку" },
      { status: 409 }
    );
  }

  await prisma.deal.update({ where: { id }, data: { status: "CANCELLED" } });

  // освобождаем использование промокода, если был
  if (deal.promoCodeId) {
    await prisma.promoCode.update({
      where: { id: deal.promoCodeId },
      data: { usedCount: { decrement: 1 } },
    });
  }

  return NextResponse.json({ ok: true, status: "CANCELLED" });
}
