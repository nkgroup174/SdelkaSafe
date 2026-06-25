import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({ reason: z.string().min(3).max(500) });

// POST /api/deals/[id]/dispute — открыть спор по оплаченной сделке
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
    return NextResponse.json({ error: "Опишите причину спора" }, { status: 400 });
  }
  const deal = await prisma.deal.findUnique({ where: { id } });
  if (!deal || (deal.buyerId !== session.user.id && deal.sellerId !== session.user.id)) {
    return NextResponse.json({ error: "Сделка не найдена" }, { status: 404 });
  }
  if (deal.status !== "PAID") {
    return NextResponse.json(
      { error: "Спор можно открыть только по оплаченной сделке" },
      { status: 409 }
    );
  }
  await prisma.deal.update({
    where: { id },
    data: { status: "DISPUTED", disputeReason: parsed.data.reason },
  });
  return NextResponse.json({ ok: true });
}
