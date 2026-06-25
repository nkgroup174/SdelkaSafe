import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const createSchema = z.object({
  code: z.string().min(2).max(40),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().positive(),
  minOrderRub: z.number().nonnegative().default(0),
  maxUses: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

async function requireAdmin() {
  const session = await getSession();
  return session?.user?.role === "ADMIN" ? session : null;
}

export async function GET() {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ codes });
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }
  const d = parsed.data;
  try {
    const promo = await prisma.promoCode.create({
      data: {
        code: d.code.trim().toUpperCase(),
        type: d.type,
        value: d.value,
        minOrderRub: d.minOrderRub,
        maxUses: d.maxUses ?? null,
        expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      },
    });
    return NextResponse.json({ ok: true, promo }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Такой код уже существует" }, { status: 409 });
  }
}
