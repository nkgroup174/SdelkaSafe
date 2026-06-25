import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  listingId: z.string().uuid(),
  reason: z.string().min(3).max(500),
});

// POST /api/reports — пожаловаться на объявление
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Опишите причину" }, { status: 400 });
  }
  await prisma.report.create({
    data: {
      listingId: parsed.data.listingId,
      reporterId: session.user.id,
      reason: parsed.data.reason,
    },
  });
  return NextResponse.json({ ok: true });
}
