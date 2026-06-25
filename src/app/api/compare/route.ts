import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({ listingId: z.string().uuid() });
const MAX_COMPARE = 4;

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ ids: [] });
  const items = await prisma.comparisonItem.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  });
  return NextResponse.json({ ids: items.map((i) => i.listingId) });
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const where = {
    userId_listingId: { userId: session.user.id, listingId: parsed.data.listingId },
  };
  const existing = await prisma.comparisonItem.findUnique({ where });
  if (existing) {
    await prisma.comparisonItem.delete({ where });
    return NextResponse.json({ added: false });
  }
  const count = await prisma.comparisonItem.count({
    where: { userId: session.user.id },
  });
  if (count >= MAX_COMPARE) {
    return NextResponse.json(
      { error: `Можно сравнивать не более ${MAX_COMPARE} позиций` },
      { status: 400 }
    );
  }
  await prisma.comparisonItem.create({
    data: { userId: session.user.id, listingId: parsed.data.listingId },
  });
  return NextResponse.json({ added: true });
}
