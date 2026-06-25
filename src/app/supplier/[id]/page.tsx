import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";
import { Rating } from "@/components/Rating";

export const dynamic = "force-dynamic";

export default async function SupplierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supplier = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isVerified: true,
      role: true,
      createdAt: true,
      avatarUrl: true,
      about: true,
      city: true,
      website: true,
    },
  });
  if (!supplier || supplier.role !== "SUPPLIER") notFound();

  const [listings, agg, reviews] = await Promise.all([
    prisma.listing.findMany({
      where: { supplierId: id, status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 24,
    }),
    prisma.review.aggregate({
      where: { deal: { sellerId: id } },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.review.findMany({
      where: { deal: { sellerId: id } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  const avg = agg._avg.rating ?? 0;
  const count = agg._count;

  return (
    <div className="container-page py-10">
      {/* Шапка поставщика */}
      <div className="card p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            {supplier.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={supplier.avatarUrl}
                alt=""
                className="h-16 w-16 rounded-xl object-cover border border-white/10"
              />
            ) : (
              <div className="h-16 w-16 rounded-xl bg-white/10 flex items-center justify-center text-2xl text-slate-400">
                {(supplier.name ?? "П").slice(0, 1).toUpperCase()}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">
                {supplier.name ?? "Поставщик"}
                {supplier.isVerified && (
                  <span className="ml-2 align-middle badge text-emerald-400">✓ проверен</span>
                )}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                {supplier.city ? `${supplier.city} · ` : ""}на платформе с{" "}
                {supplier.createdAt.toLocaleDateString("ru-RU")}
              </p>
              {supplier.website && (
                <a
                  href={supplier.website.startsWith("http") ? supplier.website : `https://${supplier.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm text-blue-400 hover:underline"
                >
                  {supplier.website}
                </a>
              )}
            </div>
          </div>
          {count > 0 ? (
            <Rating value={avg} count={count} size="lg" />
          ) : (
            <span className="text-sm text-slate-500">Пока нет отзывов</span>
          )}
        </div>
        {supplier.about && (
          <p className="mt-4 text-sm text-slate-300 whitespace-pre-line">{supplier.about}</p>
        )}
      </div>

      {/* Объявления */}
      <h2 className="mt-10 text-lg font-semibold text-white">
        Объявления ({listings.length})
      </h2>
      {listings.length === 0 ? (
        <p className="mt-3 text-slate-400">Активных объявлений нет.</p>
      ) : (
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {listings.map((l) => (
            <ListingCard
              key={l.id}
              id={l.id}
              title={l.title}
              category={l.category}
              priceRub={l.priceRub}
              imageUrl={l.imageUrl}
              unit={l.unit}
            />
          ))}
        </div>
      )}

      {/* Отзывы */}
      <h2 className="mt-10 text-lg font-semibold text-white">Отзывы ({count})</h2>
      {reviews.length === 0 ? (
        <p className="mt-3 text-slate-400">Отзывов пока нет.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">
                  {r.author.name ?? "Покупатель"}
                </span>
                <Rating value={r.rating} />
              </div>
              <p className="mt-2 text-sm text-slate-300">{r.comment}</p>
              {r.reply && (
                <div className="mt-2 border-l-2 border-white/15 pl-3 text-sm text-slate-400">
                  <span className="font-medium">Ответ поставщика:</span> {r.reply}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
