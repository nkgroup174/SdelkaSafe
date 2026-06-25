import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({ listingId: z.string().uuid() });

// GET — список id избранного текущего пользователя
export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ ids: [] });
  const items = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    select: { listingId: true },
  });
  return NextResponse.json({ ids: items.map((i) => i.listingId) });
}

// POST — переключить избранное
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
  const existing = await prisma.favorite.findUnique({ where });
  if (existing) {
    await prisma.favorite.delete({ where });
    return NextResponse.json({ favorited: false });
  }
  await prisma.favorite.create({
    data: { userId: session.user.id, listingId: parsed.data.listingId },
  });
  return NextResponse.json({ favorited: true });
}
