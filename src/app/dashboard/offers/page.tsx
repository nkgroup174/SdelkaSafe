import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { OfferActions } from "@/components/OfferActions";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  PENDING: "Ожидает ответа",
  ACCEPTED: "Принято",
  DECLINED: "Отклонено",
  CANCELLED: "Отозвано",
};

export default async function OffersPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  const uid = session.user.id;

  const [incoming, outgoing] = await Promise.all([
    prisma.offer.findMany({
      where: { sellerId: uid },
      include: { listing: { select: { title: true } }, buyer: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
    }),
    prisma.offer.findMany({
      where: { buyerId: uid },
      include: { listing: { select: { title: true } } },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Предложения цены</h1>

      {/* Входящие (поставщику) */}
      {incoming.length > 0 && (
        <>
          <h2 className="mt-8 text-lg font-semibold text-white">Входящие</h2>
          <div className="mt-4 space-y-3">
            {incoming.map((o) => (
              <div key={o.id} className="card p-4 flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <div className="font-medium text-white">{o.listing.title}</div>
                  <div className="text-sm text-slate-400">
                    {o.offeredPriceRub.toLocaleString("ru-RU")} ₽ × {o.quantity} ={" "}
                    {(o.offeredPriceRub * o.quantity).toLocaleString("ru-RU")} ₽
                    {" · "}от {o.buyer.name ?? o.buyer.email}
                  </div>
                  {o.message && <p className="mt-1 text-sm text-slate-300">«{o.message}»</p>}
                  <div className="mt-1 text-xs text-slate-500">{STATUS[o.status]}</div>
                </div>
                {o.status === "PENDING" && <OfferActions offerId={o.id} role="seller" />}
                {o.status === "ACCEPTED" && o.dealId && (
                  <Link href={`/dashboard/deals/${o.dealId}`} className="btn btn-outline">
                    К сделке
                  </Link>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Исходящие (от покупателя) */}
      <h2 className="mt-8 text-lg font-semibold text-white">Мои предложения</h2>
      {outgoing.length === 0 ? (
        <p className="mt-3 text-slate-400">
          Вы пока не предлагали цену.{" "}
          <Link href="/catalog/products" className="underline">В каталог</Link>
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {outgoing.map((o) => (
            <div key={o.id} className="card p-4 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-medium text-white">{o.listing.title}</div>
                <div className="text-sm text-slate-400">
                  {o.offeredPriceRub.toLocaleString("ru-RU")} ₽ × {o.quantity}
                </div>
                <div className="mt-1 text-xs text-slate-500">{STATUS[o.status]}</div>
              </div>
              {o.status === "PENDING" && <OfferActions offerId={o.id} role="buyer" />}
              {o.status === "ACCEPTED" && o.dealId && (
                <Link href={`/dashboard/deals/${o.dealId}`} className="btn btn-primary">
                  Оплатить сделку
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
