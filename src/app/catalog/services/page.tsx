import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { SERVICE_CATEGORIES } from "@/lib/constants";
import { ListingCard } from "@/components/ListingCard";
import { FilterPanel } from "@/components/FilterPanel";
import { SubscribeButton } from "@/components/SubscribeButton";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { categoryName } from "@/lib/constants";

export const dynamic = "force-dynamic";

const PER = 24;
const WEEK = 7 * 24 * 60 * 60 * 1000;

type SP = {
  category?: string;
  subcategory?: string;
  q?: string;
  page?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
};

function orderFor(sort?: string): Prisma.ListingOrderByWithRelationInput[] {
  switch (sort) {
    case "old": return [{ createdAt: "asc" }];
    case "price_asc": return [{ priceRub: "asc" }];
    case "price_desc": return [{ priceRub: "desc" }];
    case "title_asc": return [{ title: "asc" }];
    case "title_desc": return [{ title: "desc" }];
    case "verified": return [{ supplier: { isVerified: "desc" } }, { createdAt: "desc" }];
    default: return [{ boostedUntil: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }];
  }
}

export default async function ServicesCatalog({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const { category, subcategory, q, page: pageParam, minPrice, maxPrice, sort } =
    await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const priceFilter: Prisma.FloatFilter = {};
  if (minPrice) priceFilter.gte = Number(minPrice);
  if (maxPrice) priceFilter.lte = Number(maxPrice);

  const where: Prisma.ListingWhereInput = {
    type: "SERVICE",
    status: "APPROVED",
    ...(category ? { category } : {}),
    ...(subcategory ? { subcategory } : {}),
    ...(q ? { title: { contains: q, mode: "insensitive" } } : {}),
    ...(minPrice || maxPrice ? { priceRub: priceFilter } : {}),
  };

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: { supplier: { select: { name: true, isVerified: true } } },
      orderBy: orderFor(sort),
      skip: (page - 1) * PER,
      take: PER,
    }),
    prisma.listing.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PER);
  const now = Date.now();

  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (category) sp.set("category", category);
    if (subcategory) sp.set("subcategory", subcategory);
    if (q) sp.set("q", q);
    if (minPrice) sp.set("minPrice", minPrice);
    if (maxPrice) sp.set("maxPrice", maxPrice);
    if (sort) sp.set("sort", sort);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/catalog/services${s ? `?${s}` : ""}`;
  };

  return (
    <div className="container-page py-10">
      <Breadcrumbs
        items={[
          { label: "Главная", href: "/" },
          { label: "Услуги", href: category ? "/catalog/services" : undefined },
          ...(category ? [{ label: categoryName(category) }] : []),
        ]}
      />
      <h1 className="mt-3 text-3xl font-bold text-white">Каталог услуг</h1>

      <div className="mt-6">
        <FilterPanel
          type="SERVICE"
          categories={SERVICE_CATEGORIES}
          initial={{ q, category, subcategory, minPrice, maxPrice, sort }}
        />
      </div>
      {category && (
        <div className="mt-3">
          <SubscribeButton category={category} />
        </div>
      )}

      {listings.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Услуги не найдены.
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {listings.map((l) => (
              <ListingCard
                key={l.id}
                id={l.id}
                title={l.title}
                category={l.category}
                priceRub={l.priceRub}
                imageUrl={l.imageUrl}
                supplierName={l.supplier.name}
                isVerified={l.supplier.isVerified}
                unit={l.unit}
                isNew={now - l.createdAt.getTime() < WEEK}
                boosted={!!l.boostedUntil && l.boostedUntil.getTime() > now}
                oldPriceRub={l.oldPriceRub}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-3 text-sm">
              {page > 1 ? (
                <Link href={qs(page - 1)} className="btn btn-outline">← Назад</Link>
              ) : (
                <span className="btn btn-outline opacity-40 pointer-events-none">← Назад</span>
              )}
              <span className="text-slate-400">Стр. {page} из {totalPages}</span>
              {page < totalPages ? (
                <Link href={qs(page + 1)} className="btn btn-outline">Вперёд →</Link>
              ) : (
                <span className="btn btn-outline opacity-40 pointer-events-none">Вперёд →</span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
