import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { sendEmail, emailConfigured } from "@/lib/email";
import { categoryName } from "@/lib/constants";

const APP_URL = process.env.APP_URL || "https://sdelkasafe.ru";

// POST /api/admin/digest — разослать подписчикам новинки за 7 дней по их категориям
export async function POST() {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const subs = await prisma.categorySubscription.findMany({
    include: { user: { select: { email: true } } },
  });

  // группируем подписчиков по категории
  const byCat = new Map<string, string[]>();
  for (const s of subs) {
    const arr = byCat.get(s.category) ?? [];
    arr.push(s.user.email);
    byCat.set(s.category, arr);
  }

  let emailsSent = 0;
  let categoriesProcessed = 0;

  for (const [category, emails] of byCat) {
    const fresh = await prisma.listing.findMany({
      where: { category, status: "APPROVED", createdAt: { gte: weekAgo } },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, title: true, priceRub: true },
    });
    if (fresh.length === 0) continue;
    categoriesProcessed++;

    const body =
      `Новинки в категории «${categoryName(category)}» за неделю:\n\n` +
      fresh
        .map((l) => `• ${l.title} — ${l.priceRub.toLocaleString("ru-RU")} ₽\n  ${APP_URL}/listing/${l.id}`)
        .join("\n") +
      `\n\nОтписаться можно в каталоге категории.`;

    for (const email of emails) {
      const ok = await sendEmail(email, `SdelkaSafe: новинки в категории`, body);
      if (ok) emailsSent++;
    }
  }

  return NextResponse.json({
    ok: true,
    emailConfigured,
    categoriesProcessed,
    emailsSent,
  });
}
