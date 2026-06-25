import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const patchSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().min(10).optional(),
  category: z.string().min(1).optional(),
  subcategory: z.string().optional(),
  priceRub: z.number().positive().optional(),
  oldPriceRub: z.number().nonnegative().optional(),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  images: z.array(z.string().max(500)).max(8).optional(),
  stock: z.number().int().nonnegative().optional(),
  moq: z.number().int().positive().optional(),
  brand: z.string().optional(),
  unit: z.enum(["HOUR", "DAY", "PROJECT", "MONTH"]).optional(),
  duration: z.string().optional(),
  // действие со статусом
  action: z.enum(["archive", "restore"]).optional(),
});

async function ownned(id: string, userId: string, isAdmin: boolean) {
  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return null;
  if (listing.supplierId !== userId && !isAdmin) return null;
  return listing;
}

// GET — данные объявления (для формы редактирования)
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const listing = await ownned(id, session.user.id, session.user.role === "ADMIN");
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });
  return NextResponse.json({ listing });
}

// PATCH — редактирование или архив/восстановление
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const listing = await ownned(id, session.user.id, session.user.role === "ADMIN");
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const { action, imageUrl, images, ...rest } = parsed.data;

  const data: Record<string, unknown> = { ...rest };
  // старая цена: 0/пусто → убрать скидку
  if ("oldPriceRub" in data) {
    const v = Number(data.oldPriceRub);
    data.oldPriceRub = v > 0 ? v : null;
  }
  if (images !== undefined) {
    data.images = images;
    data.imageUrl = images[0] ?? null;
  } else if (imageUrl !== undefined) {
    data.imageUrl = imageUrl || null;
  }
  if (action === "archive") data.status = "ARCHIVED";
  // При восстановлении объявление снова уходит на модерацию
  if (action === "restore") data.status = "PENDING";
  // Если редактировали содержимое одобренного — отправляем на повторную модерацию
  if (!action && Object.keys(rest).length > 0 && listing.status === "APPROVED") {
    data.status = "PENDING";
  }

  const updated = await prisma.listing.update({ where: { id }, data });
  return NextResponse.json({ ok: true, listing: updated });
}

// DELETE — удалить объявление
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const { id } = await params;
  const listing = await ownned(id, session.user.id, session.user.role === "ADMIN");
  if (!listing) return NextResponse.json({ error: "Не найдено" }, { status: 404 });

  // Если по объявлению есть сделки — не удаляем, а архивируем
  const dealsCount = await prisma.deal.count({ where: { listingId: id } });
  if (dealsCount > 0) {
    await prisma.listing.update({ where: { id }, data: { status: "ARCHIVED" } });
    return NextResponse.json({ ok: true, archived: true });
  }
  await prisma.listing.delete({ where: { id } });
  return NextResponse.json({ ok: true, deleted: true });
}
