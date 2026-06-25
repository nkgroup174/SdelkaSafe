import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// PATCH /api/admin/reports/[id] — отметить жалобу решённой
export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const { id } = await params;
  await prisma.report.update({ where: { id }, data: { resolved: true } });
  return NextResponse.json({ ok: true });
}
