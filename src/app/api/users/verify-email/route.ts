import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendEmail, emailConfigured } from "@/lib/email";

// POST — отправить код подтверждения на email
export async function POST() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  if (user.emailVerified) {
    return NextResponse.json({ error: "Email уже подтверждён" }, { status: 400 });
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyCode: code,
      emailVerifyExpires: new Date(Date.now() + 10 * 60 * 1000),
    },
  });

  const sent = await sendEmail(
    user.email,
    "Код подтверждения SdelkaSafe",
    `Ваш код подтверждения: ${code}\nКод действует 10 минут.`
  );

  // В dev без настроенного SMTP возвращаем код, чтобы можно было протестировать
  const devCode =
    !emailConfigured && process.env.NODE_ENV !== "production" ? code : undefined;

  return NextResponse.json({ ok: true, sent, devCode });
}

const confirmSchema = z.object({ code: z.string().min(4).max(8) });

// PATCH — подтвердить код
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = confirmSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Введите код" }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  if (
    !user.emailVerifyCode ||
    !user.emailVerifyExpires ||
    user.emailVerifyExpires < new Date()
  ) {
    return NextResponse.json({ error: "Код истёк, запросите новый" }, { status: 400 });
  }
  if (user.emailVerifyCode !== parsed.data.code.trim()) {
    return NextResponse.json({ error: "Неверный код" }, { status: 400 });
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, emailVerifyCode: null, emailVerifyExpires: null },
  });
  return NextResponse.json({ ok: true });
}
