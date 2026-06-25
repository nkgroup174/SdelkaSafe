import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({ action: z.enum(["approve", "reject"]) });

// PATCH /api/admin/listings/[id] — модерация (только админ)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректное действие" }, { status: 400 });
  }

  await prisma.listing.update({
    where: { id },
    data: { status: parsed.data.action === "approve" ? "APPROVED" : "REJECTED" },
  });

  return NextResponse.json({ ok: true });
}
