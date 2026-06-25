import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

async function isAdmin() {
  const session = await getSession();
  return session?.user?.role === "ADMIN";
}

const createSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().max(120).optional(),
  role: z.enum(["CUSTOMER", "SUPPLIER", "ADMIN"]).default("CUSTOMER"),
});

// GET /api/admin/users — список пользователей
export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      isBlocked: true,
      isVerified: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ users });
}

// POST /api/admin/users — создать пользователя
export async function POST(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Нет доступа" }, { status: 403 });
  }
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }
  const { email, password, name, role } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) {
    return NextResponse.json({ error: "Email уже занят" }, { status: 409 });
  }
  const user = await prisma.user.create({
    data: { email: email.toLowerCase(), password: await bcrypt.hash(password, 10), name, role },
    select: { id: true, email: true, role: true },
  });
  return NextResponse.json({ ok: true, user }, { status: 201 });
}
