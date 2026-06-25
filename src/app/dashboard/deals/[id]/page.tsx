import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DealChat } from "@/components/DealChat";
import { ReviewBlock } from "@/components/ReviewBlock";
import { ConfirmReceiptButton } from "@/components/ConfirmReceiptButton";
import { CancelDealButton } from "@/components/CancelDealButton";
import { OpenDisputeButton } from "@/components/DisputeButtons";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачено",
  COMPLETED: "Завершено",
  CANCELLED: "Отменено",
  DISPUTED: "Спор",
};

export default async function DealPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  const { id } = await params;

  const deal = await prisma.deal.findUnique({
    where: { id },
    include: {
      listing: { select: { title: true, id: true } },
      buyer: { select: { name: true, email: true } },
      seller: { select: { name: true, email: true } },
      review: { select: { rating: true, comment: true, reply: true } },
    },
  });
  if (!deal) notFound();

  const uid = session.user.id;
  if (deal.buyerId !== uid && deal.sellerId !== uid) redirect("/dashboard/deals");

  const isBuyer = deal.buyerId === uid;
  const counterpart = isBuyer ? deal.seller : deal.buyer;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div>
        <Link href="/dashboard/deals" className="text-sm text-slate-500 hover:underline">
          ← Все сделки
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">
          {deal.listing.title}
        </h1>
        <p className="mt-1 text-slate-600">
          {deal.orderNumber} ·{" "}
          <span className="font-medium">{STATUS[deal.status] ?? deal.status}</span>
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 text-sm">
        <Info k="Сумма" v={`${deal.amountRub.toLocaleString("ru-RU")} ₽`} />
        <Info
          k="В TON"
          v={deal.amountTon ? `${deal.amountTon} TON` : "—"}
        />
        <Info k="Количество" v={String(deal.quantity)} />
        <Info
          k={isBuyer ? "Поставщик" : "Покупатель"}
          v={counterpart.name ?? counterpart.email}
        />
        {deal.txHash && <Info k="Транзакция" v={deal.txHash.slice(0, 24) + "…"} />}
      </div>

      {deal.status === "PAID" && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between gap-3 flex-wrap">
          <span className="text-sm text-emerald-800">
            {isBuyer
              ? "Получили товар/услугу? Подтвердите — сделка закроется."
              : "Сделка оплачена. Ожидается подтверждение покупателем."}
          </span>
          <div className="flex gap-2">
            {isBuyer && <ConfirmReceiptButton dealId={deal.id} />}
            <OpenDisputeButton dealId={deal.id} />
          </div>
        </div>
      )}

      {deal.status === "DISPUTED" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Открыт спор. Решение примет администратор.
          {deal.disputeReason && <div className="mt-1 text-amber-700">Причина: {deal.disputeReason}</div>}
        </div>
      )}

      {deal.status === "PENDING" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center justify-between gap-3 flex-wrap">
          <span>
            {isBuyer ? (
              <>
                Сделка ожидает оплаты. Откройте{" "}
                <Link href={`/listing/${deal.listing.id}`} className="underline">
                  карточку объявления
                </Link>{" "}
                и оплатите через TON Connect.
              </>
            ) : (
              "Сделка ожидает оплаты покупателем."
            )}
          </span>
          <CancelDealButton dealId={deal.id} />
        </div>
      )}

      <DealChat dealId={deal.id} />

      {deal.status === "COMPLETED" && (
        <ReviewBlock
          dealId={deal.id}
          review={deal.review}
          role={isBuyer ? "buyer" : "seller"}
          canReview={isBuyer}
        />
      )}
    </div>
  );
}

function Info({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <div className="text-slate-500">{k}</div>
      <div className="mt-0.5 font-medium text-slate-900">{v}</div>
    </div>
  );
}
