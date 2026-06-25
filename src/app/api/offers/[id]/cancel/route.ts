import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// POST /api/offers/[id]/cancel — покупатель отзывает своё предложение
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const offer = await prisma.offer.findUnique({ where: { id } });
  if (!offer || offer.buyerId !== session.user.id) {
    return NextResponse.json({ error: "Предложение не найдено" }, { status: 404 });
  }
  if (offer.status !== "PENDING") {
    return NextResponse.json({ error: "Уже обработано" }, { status: 409 });
  }
  await prisma.offer.update({ where: { id }, data: { status: "CANCELLED" } });
  return NextResponse.json({ ok: true });
}
