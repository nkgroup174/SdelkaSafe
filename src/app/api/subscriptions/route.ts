import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({ category: z.string().min(1).max(60) });

export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ categories: [] });
  const subs = await prisma.categorySubscription.findMany({
    where: { userId: session.user.id },
    select: { category: true },
  });
  return NextResponse.json({ categories: subs.map((s) => s.category) });
}

// POST — переключить подписку на категорию
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
    userId_category: { userId: session.user.id, category: parsed.data.category },
  };
  const existing = await prisma.categorySubscription.findUnique({ where });
  if (existing) {
    await prisma.categorySubscription.delete({ where });
    return NextResponse.json({ subscribed: false });
  }
  await prisma.categorySubscription.create({
    data: { userId: session.user.id, category: parsed.data.category },
  });
  return NextResponse.json({ subscribed: true });
}
