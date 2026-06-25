import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendTelegramMessage } from "@/lib/telegram";

const REFERRAL_BONUS_RUB = 100;

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Минимум 6 символов"),
  name: z.string().min(2).optional(),
  role: z.enum(["CUSTOMER", "SUPPLIER"]).default("CUSTOMER"),
  ref: z.string().optional(), // реферальный код пригласившего
});

function genCode() {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
        { status: 400 }
      );
    }
    const { email, password, name, role, ref } = parsed.data;

    const exists = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (exists) {
      return NextResponse.json(
        { error: "Пользователь с таким email уже существует" },
        { status: 409 }
      );
    }

    // Реферер (если код валиден)
    const referrer = ref
      ? await prisma.user.findUnique({ where: { referralCode: ref } })
      : null;

    const hash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hash,
        name,
        role,
        referralCode: genCode(),
        referredById: referrer?.id ?? null,
      },
      select: { id: true, email: true, role: true },
    });

    // Бонус рефереру
    if (referrer) {
      await prisma.$transaction([
        prisma.user.update({
          where: { id: referrer.id },
          data: { balanceRub: { increment: REFERRAL_BONUS_RUB } },
        }),
        prisma.balanceTransaction.create({
          data: {
            userId: referrer.id,
            type: "ADJUSTMENT",
            amountRub: REFERRAL_BONUS_RUB,
            note: `Реферальный бонус за регистрацию ${user.email}`,
          },
        }),
      ]);
    }

    const adminChat = process.env.ADMIN_TELEGRAM_CHAT_ID;
    if (adminChat) {
      await sendTelegramMessage(
        adminChat,
        `👤 Новая регистрация: ${user.email} (${user.role === "SUPPLIER" ? "поставщик" : "заказчик"})`
      );
    }

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}
