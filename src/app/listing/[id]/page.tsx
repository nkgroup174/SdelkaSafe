import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { categoryName, subcategoryName } from "@/lib/constants";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { BuyBox } from "@/components/BuyBox";
import { Rating } from "@/components/Rating";
import { ListingButtons } from "@/components/ListingButtons";
import { ShareButton } from "@/components/ShareButton";
import { OfferBox } from "@/components/OfferBox";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ReportButton } from "@/components/ReportButton";
import { Gallery } from "@/components/Gallery";
import { ListingCard } from "@/components/ListingCard";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

const UNIT_LABEL: Record<string, string> = {
  HOUR: "за час",
  DAY: "за день",
  PROJECT: "за проект",
  MONTH: "за месяц",
};

export default async function ListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      supplier: { select: { name: true, isVerified: true, tonWallet: true } },
    },
  });
  if (!listing || listing.status !== "APPROVED") notFound();

  const [ratingAgg, reviews, similar] = await Promise.all([
    prisma.review.aggregate({
      where: { deal: { sellerId: listing.supplierId } },
      _avg: { rating: true },
      _count: true,
    }),
    prisma.review.findMany({
      where: { deal: { sellerId: listing.supplierId } },
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.listing.findMany({
      where: {
        type: listing.type,
        status: "APPROVED",
        category: listing.category,
        id: { not: listing.id },
      },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
  ]);

  const session = await getSession();
  if (session?.user) {
    await prisma.viewHistory.upsert({
      where: { userId_listingId: { userId: session.user.id, listingId: listing.id } },
      update: { viewedAt: new Date() },
      create: { userId: session.user.id, listingId: listing.id },
    });
  }

  const gallery = listing.images.length
    ? listing.images
    : listing.imageUrl
    ? [listing.imageUrl]
    : [];
  const outOfStock =
    listing.type === "PRODUCT" && listing.stock != null && listing.stock <= 0;

  const catBase = listing.type === "PRODUCT" ? "/catalog/products" : "/catalog/services";

  return (
    <div className="container-page py-10">
      <div className="mb-5">
        <Breadcrumbs
          items={[
            { label: "Главная", href: "/" },
            { label: listing.type === "PRODUCT" ? "Товары" : "Услуги", href: catBase },
            { label: categoryName(listing.category), href: `${catBase}?category=${listing.category}` },
            ...(listing.subcategory
              ? [{
                  label: subcategoryName(listing.category, listing.subcategory),
                  href: `${catBase}?category=${listing.category}&subcategory=${listing.subcategory}`,
                }]
              : []),
            { label: listing.title },
          ]}
        />
      </div>
      <div className="grid md:grid-cols-[1fr_320px] gap-8">
        <div>
          <Gallery images={gallery} alt={listing.title} />

          <div className="mt-5">
            <div className="text-sm text-slate-500">
              {listing.type === "PRODUCT" ? "Товар" : "Услуга"} ·{" "}
              {categoryName(listing.category)}
              {listing.subcategory && (
                <> · {subcategoryName(listing.category, listing.subcategory)}</>
              )}
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-white">{listing.title}</h1>
            <p className="mt-4 whitespace-pre-line text-slate-300">{listing.description}</p>

            <dl className="mt-6 grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
              {listing.type === "PRODUCT" ? (
                <>
                  {listing.brand && <Row k="Бренд" v={listing.brand} />}
                  {listing.moq != null && <Row k="Мин. партия" v={String(listing.moq)} />}
                  {listing.stock != null && (
                    <Row k="В наличии" v={outOfStock ? "нет" : String(listing.stock)} />
                  )}
                </>
              ) : (
                <>
                  {listing.unit && <Row k="Расчёт" v={UNIT_LABEL[listing.unit] ?? listing.unit} />}
                  {listing.duration && <Row k="Срок" v={listing.duration} />}
                </>
              )}
              <dt className="text-slate-500">Поставщик</dt>
              <dd>
                <Link href={`/supplier/${listing.supplierId}`} className="text-white hover:underline">
                  {listing.supplier.name ?? "—"}
                  {listing.supplier.isVerified && <span className="ml-1 text-emerald-400">✓</span>}
                </Link>
                {ratingAgg._count > 0 && (
                  <div className="mt-1">
                    <Rating value={ratingAgg._avg.rating ?? 0} count={ratingAgg._count} />
                  </div>
                )}
              </dd>
            </dl>

            <div className="mt-4">
              <ReportButton listingId={listing.id} />
            </div>
          </div>

          {/* Отзывы поставщика */}
          {reviews.length > 0 && (
            <div className="mt-10">
              <h2 className="text-lg font-semibold text-white">Отзывы о поставщике</h2>
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
                        <span className="font-medium">Ответ:</span> {r.reply}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <BuyBox
            listingId={listing.id}
            priceRub={listing.priceRub}
            sellerWallet={listing.supplier.tonWallet}
            outOfStock={outOfStock}
            oldPriceRub={listing.oldPriceRub}
          />
          {!outOfStock && (
            <AddToCartButton
              item={{
                listingId: listing.id,
                title: listing.title,
                priceRub: listing.priceRub,
                imageUrl: listing.imageUrl,
                supplierId: listing.supplierId,
                supplierName: listing.supplier.name,
              }}
            />
          )}
          {!outOfStock && <OfferBox listingId={listing.id} priceRub={listing.priceRub} />}
          <ListingButtons listingId={listing.id} />
          <ShareButton title={listing.title} />
        </aside>
      </div>

      {/* Похожие */}
      {similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-lg font-semibold text-white">Похожие объявления</h2>
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            {similar.map((l) => (
              <ListingCard
                key={l.id}
                id={l.id}
                title={l.title}
                category={l.category}
                priceRub={l.priceRub}
                imageUrl={l.imageUrl}
                unit={l.unit}
                outOfStock={l.type === "PRODUCT" && l.stock != null && l.stock <= 0}
                oldPriceRub={l.oldPriceRub}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-slate-500">{k}</dt>
      <dd className="text-slate-900">{v}</dd>
    </>
  );
}
