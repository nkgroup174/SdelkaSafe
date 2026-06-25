import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { BOOST_COST_RUB, BOOST_DAYS } from "@/lib/constants";

// POST /api/listings/[id]/boost — продвинуть объявление (списывается с баланса поставщика)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing || listing.supplierId !== session.user.id) {
    return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  }
  if (listing.status !== "APPROVED") {
    return NextResponse.json(
      { error: "Продвигать можно только опубликованные объявления" },
      { status: 400 }
    );
  }

  const until = new Date(Date.now() + BOOST_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { balanceRub: { decrement: BOOST_COST_RUB } },
    }),
    prisma.balanceTransaction.create({
      data: {
        userId: session.user.id,
        type: "ADJUSTMENT",
        amountRub: -BOOST_COST_RUB,
        note: `Продвижение «${listing.title}» на ${BOOST_DAYS} дн.`,
      },
    }),
    prisma.listing.update({ where: { id }, data: { boostedUntil: until } }),
  ]);

  return NextResponse.json({ ok: true, boostedUntil: until });
}
