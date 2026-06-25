import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const createSchema = z.object({
  type: z.enum(["PRODUCT", "SERVICE"]),
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  priceRub: z.number().positive(),
  oldPriceRub: z.number().positive().optional(),
  imageUrl: z.string().max(500).optional().or(z.literal("")),
  images: z.array(z.string().max(500)).max(8).optional(),
  // товар
  stock: z.number().int().nonnegative().optional(),
  moq: z.number().int().positive().optional(),
  brand: z.string().optional(),
  // услуга
  unit: z.enum(["HOUR", "DAY", "PROJECT", "MONTH"]).optional(),
  duration: z.string().optional(),
});

// GET /api/listings?type=PRODUCT&category=...&q=...
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const category = searchParams.get("category");
  const q = searchParams.get("q");

  const listings = await prisma.listing.findMany({
    where: {
      status: "APPROVED",
      ...(type === "PRODUCT" || type === "SERVICE" ? { type } : {}),
      ...(category ? { category } : {}),
      ...(q
        ? { title: { contains: q, mode: "insensitive" as const } }
        : {}),
    },
    include: { supplier: { select: { name: true, isVerified: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ listings });
}

// POST /api/listings — создать объявление (только поставщик)
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (session.user.role !== "SUPPLIER" && session.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Только поставщик может размещать объявления" },
      { status: 403 }
    );
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Некорректные данные" },
      { status: 400 }
    );
  }
  const d = parsed.data;

  const listing = await prisma.listing.create({
    data: {
      type: d.type,
      title: d.title,
      description: d.description,
      category: d.category,
      subcategory: d.subcategory || null,
      priceRub: d.priceRub,
      oldPriceRub: d.oldPriceRub && d.oldPriceRub > d.priceRub ? d.oldPriceRub : null,
      images: d.images ?? [],
      imageUrl: d.images?.[0] || d.imageUrl || null,
      stock: d.type === "PRODUCT" ? d.stock ?? 0 : null,
      moq: d.type === "PRODUCT" ? d.moq ?? 1 : null,
      brand: d.type === "PRODUCT" ? d.brand ?? null : null,
      unit: d.type === "SERVICE" ? d.unit ?? "PROJECT" : null,
      duration: d.type === "SERVICE" ? d.duration ?? null : null,
      status: "PENDING", // объявление уходит на модерацию
      supplierId: session.user.id,
    },
  });

  return NextResponse.json({ ok: true, listing }, { status: 201 });
}
