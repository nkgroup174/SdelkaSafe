import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { PRODUCT_CATEGORIES } from "@/lib/constants";

export const runtime = "nodejs";

// Алиасы заголовков (в т.ч. формат МойСклад)
const ALIASES: Record<string, string[]> = {
  title: ["title", "наименование", "название", "товар", "name"],
  description: ["description", "описание"],
  price: ["price", "цена", "цена продажи", "цена, руб", "стоимость"],
  category: ["category", "категория"],
  stock: ["stock", "остаток", "количество", "в наличии", "кол-во"],
  moq: ["moq", "мин. партия", "минимальная партия", "мин партия"],
  brand: ["brand", "бренд", "производитель", "марка"],
};

const validSlugs = new Set(PRODUCT_CATEGORIES.map((c) => c.slug));

function parseCsv(text: string): string[][] {
  const lines = text.replace(/\r/g, "").split("\n").filter((l) => l.trim());
  const delimiter = lines[0]?.includes(";") ? ";" : ",";
  return lines.map((line) =>
    line.split(delimiter).map((c) => c.trim().replace(/^"|"$/g, ""))
  );
}

function colIndex(header: string[], key: string): number {
  const aliases = ALIASES[key] ?? [key];
  return header.findIndex((h) => aliases.includes(h.toLowerCase().trim()));
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  if (session.user.role !== "SUPPLIER" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Только поставщик" }, { status: 403 });
  }

  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Файл не передан" }, { status: 400 });
  }

  // Получаем строки таблицы из XLSX или CSV
  let rows: string[][] = [];
  const buf = Buffer.from(await file.arrayBuffer());
  const isExcel = /\.(xlsx|xls)$/i.test(file.name);
  if (isExcel) {
    const wb = XLSX.read(buf, { type: "buffer" });
    const sheet = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, raw: false, defval: "" });
  } else {
    rows = parseCsv(buf.toString("utf-8"));
  }

  rows = rows.filter((r) => r.some((c) => String(c).trim()));
  if (rows.length < 2) {
    return NextResponse.json(
      { error: "Нужен заголовок и хотя бы одна строка" },
      { status: 400 }
    );
  }

  const header = rows[0].map((h) => String(h));
  const ci = {
    title: colIndex(header, "title"),
    description: colIndex(header, "description"),
    price: colIndex(header, "price"),
    category: colIndex(header, "category"),
    stock: colIndex(header, "stock"),
    moq: colIndex(header, "moq"),
    brand: colIndex(header, "brand"),
  };
  if (ci.title < 0 || ci.price < 0) {
    return NextResponse.json(
      { error: "Не найдены обязательные колонки: наименование и цена" },
      { status: 400 }
    );
  }

  let created = 0;
  const errors: string[] = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i].map((c) => String(c ?? ""));
    const title = r[ci.title]?.trim();
    const price = Number((r[ci.price] ?? "").replace(/\s/g, "").replace(",", "."));
    if (!title || !price || price <= 0) {
      errors.push(`Строка ${i + 1}: нет названия или цены`);
      continue;
    }
    const rawCat = ci.category >= 0 ? r[ci.category]?.trim() : "";
    const category = validSlugs.has(rawCat) ? rawCat : "prochee-tovary";

    await prisma.listing.create({
      data: {
        type: "PRODUCT",
        status: "PENDING",
        supplierId: session.user.id,
        title,
        description: ci.description >= 0 && r[ci.description] ? r[ci.description] : title,
        priceRub: price,
        category,
        stock: ci.stock >= 0 ? Math.trunc(Number(r[ci.stock])) || 0 : 0,
        moq: ci.moq >= 0 ? Math.trunc(Number(r[ci.moq])) || 1 : 1,
        brand: ci.brand >= 0 ? r[ci.brand] || null : null,
      },
    });
    created++;
  }

  return NextResponse.json({ ok: true, created, errors });
}
