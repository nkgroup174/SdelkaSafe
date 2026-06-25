import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  action: z.enum(["delete", "approve", "reject", "archive"]),
});

// POST /api/admin/listings/bulk — массовые действия над объявлениями (только админ)
export async function POST(req: Request) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }
  const { ids, action } = parsed.data;

  if (action === "approve" || action === "reject" || action === "archive") {
    const status =
      action === "approve" ? "APPROVED" : action === "reject" ? "REJECTED" : "ARCHIVED";
    await prisma.listing.updateMany({ where: { id: { in: ids } }, data: { status } });
    return NextResponse.json({ ok: true, updated: ids.length });
  }

  // delete: если по объявлению есть сделки — архивируем, иначе удаляем
  const withDeals = await prisma.deal.findMany({
    where: { listingId: { in: ids } },
    select: { listingId: true },
    distinct: ["listingId"],
  });
  const lockedIds = new Set(withDeals.map((d) => d.listingId));
  const deletableIds = ids.filter((id) => !lockedIds.has(id));
  const archiveIds = ids.filter((id) => lockedIds.has(id));

  await prisma.$transaction([
    prisma.listing.deleteMany({ where: { id: { in: deletableIds } } }),
    prisma.listing.updateMany({
      where: { id: { in: archiveIds } },
      data: { status: "ARCHIVED" },
    }),
  ]);

  return NextResponse.json({
    ok: true,
    deleted: deletableIds.length,
    archived: archiveIds.length,
  });
}
