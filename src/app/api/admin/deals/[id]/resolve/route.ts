import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({ resolution: z.enum(["complete", "cancel"]) });

// POST /api/admin/deals/[id]/resolve — админ разрешает спор
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (deal.status !== "DISPUTED") {
    return NextResponse.json({ error: "Сделка не в споре" }, { status: 409 });
  }

  if (parsed.data.resolution === "complete") {
    // В пользу поставщика: закрываем и списываем комиссию
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
          note: `Комиссия по сделке ${deal.orderNumber} (спор решён)`,
        },
      }),
    ]);
  } else {
    await prisma.deal.update({ where: { id }, data: { status: "CANCELLED" } });
  }

  return NextResponse.json({ ok: true });
}
