import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  role: z.enum(["CUSTOMER", "SUPPLIER", "ADMIN"]).optional(),
  isBlocked: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  name: z.string().max(120).optional(),
});

// PATCH /api/admin/users/[id] — редактирование пользователя
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  // Нельзя разжаловать/заблокировать самого себя
  if (id === session.user.id && (parsed.data.role || parsed.data.isBlocked)) {
    return NextResponse.json(
      { error: "Нельзя менять роль или блокировать свой аккаунт" },
      { status: 400 }
    );
  }
  const user = await prisma.user.update({
    where: { id },
    data: parsed.data,
    select: { id: true, role: true, isBlocked: true, isVerified: true, name: true },
  });
  return NextResponse.json({ ok: true, user });
}

// DELETE /api/admin/users/[id]
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  if (id === session.user.id) {
    return NextResponse.json({ error: "Нельзя удалить свой аккаунт" }, { status: 400 });
  }

  // Если есть объявления или сделки — не удаляем, а блокируем (целостность данных)
  const [listings, deals] = await Promise.all([
    prisma.listing.count({ where: { supplierId: id } }),
    prisma.deal.count({ where: { OR: [{ buyerId: id }, { sellerId: id }] } }),
  ]);
  if (listings > 0 || deals > 0) {
    await prisma.user.update({ where: { id }, data: { isBlocked: true } });
    return NextResponse.json({ ok: true, blocked: true });
  }
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
}
