import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  amountRub: z.number().positive(),
  txHash: z.string().min(1),
});

// POST /api/balance/topup — зачисление пополнения на баланс комиссий поставщика.
// Поставщик перевёл TON на кошелёк платформы, фиксируем депозит.
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (session.user.role !== "SUPPLIER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Только поставщик" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const [user] = await prisma.$transaction([
    prisma.user.update({
      where: { id: session.user.id },
      data: { balanceRub: { increment: parsed.data.amountRub } },
      select: { balanceRub: true },
    }),
    prisma.balanceTransaction.create({
      data: {
        userId: session.user.id,
        type: "DEPOSIT",
        amountRub: parsed.data.amountRub,
        note: `Пополнение, tx ${parsed.data.txHash.slice(0, 16)}…`,
      },
    }),
  ]);

  return NextResponse.json({ ok: true, balanceRub: user.balanceRub });
}
