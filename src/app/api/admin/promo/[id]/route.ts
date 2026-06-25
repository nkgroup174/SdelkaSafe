import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}

// PATCH — включить/выключить промокод
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  const promo = await prisma.promoCode.findUnique({ where: { id } });
  if (!promo) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  const updated = await prisma.promoCode.update({
    where: { id },
    data: { isActive: !promo.isActive },
  });
  return NextResponse.json({ ok: true, isActive: updated.isActive });
}

// DELETE — удалить промокод
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  // если по промокоду были сделки — только деактивируем
  const used = await prisma.deal.count({ where: { promoCodeId: id } });
  if (used > 0) {
    await prisma.promoCode.update({ where: { id }, data: { isActive: false } });
    return NextResponse.json({ ok: true, deactivated: true });
  }
  await prisma.promoCode.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
}
