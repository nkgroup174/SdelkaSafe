import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/ListingCard";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const history = await prisma.viewHistory.findMany({
    where: { userId: session.user.id },
    include: { listing: true },
    orderBy: { viewedAt: "desc" },
    take: 40,
  });

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-white">История просмотров</h1>
      {history.length === 0 ? (
        <p className="mt-4 text-slate-400">
          Вы ещё не просматривали объявления.{" "}
          <Link href="/catalog/products" className="underline">
            В каталог
          </Link>
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {history.map((h) => (
            <ListingCard
              key={h.id}
              id={h.listing.id}
              title={h.listing.title}
              category={h.listing.category}
              priceRub={h.listing.priceRub}
              imageUrl={h.listing.imageUrl}
              unit={h.listing.unit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
