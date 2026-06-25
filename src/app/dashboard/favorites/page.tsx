import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function FavoritesPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const favs = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { listing: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-white">Избранное</h1>
      {favs.length === 0 ? (
        <p className="mt-4 text-slate-400">
          Пусто.{" "}
          <Link href="/catalog/products" className="underline">
            Перейти в каталог
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {favs.map((f) => (
            <ListingCard
              key={f.listing.id}
              id={f.listing.id}
              title={f.listing.title}
              category={f.listing.category}
              priceRub={f.listing.priceRub}
              imageUrl={f.listing.imageUrl}
              unit={f.listing.unit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
