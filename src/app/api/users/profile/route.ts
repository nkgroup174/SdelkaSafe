import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const schema = z.object({
  name: z.string().max(120).optional(),
  phone: z.string().max(30).optional(),
  tonWallet: z.string().max(80).optional(),
  avatarUrl: z.string().max(500).optional().or(z.literal("")),
  about: z.string().max(1000).optional(),
  city: z.string().max(80).optional(),
  website: z.string().max(200).optional(),
  inn: z.string().max(20).optional(),
  ogrn: z.string().max(20).optional(),
});

// PATCH /api/users/profile — обновить свой профиль
export async function PATCH(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
  }

  const d = parsed.data;
  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: d.name,
      phone: d.phone,
      tonWallet: d.tonWallet || null,
      avatarUrl: d.avatarUrl || null,
      about: d.about,
      city: d.city,
      website: d.website,
      inn: d.inn,
      ogrn: d.ogrn,
    },
    select: { id: true, name: true, avatarUrl: true },
  });

  return NextResponse.json({ ok: true, user });
}

// GET /api/users/profile — краткие данные для шапки (аватар, имя)
export async function GET() {
  const session = await getSession();
  if (!session?.user) return NextResponse.json({ user: null });
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, avatarUrl: true },
  });
  return NextResponse.json({ user });
}
