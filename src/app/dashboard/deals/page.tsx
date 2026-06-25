import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ConfirmReceiptButton } from "@/components/ConfirmReceiptButton";

export const dynamic = "force-dynamic";

const STATUS: Record<string, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачено",
  COMPLETED: "Завершено",
  CANCELLED: "Отменено",
  DISPUTED: "Спор",
};

export default async function DealsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  const uid = session.user.id;

  const deals = await prisma.deal.findMany({
    where: { OR: [{ buyerId: uid }, { sellerId: uid }] },
    include: { listing: { select: { title: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-semibold text-slate-900">Мои сделки</h1>

      {deals.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Сделок пока нет.{" "}
          <Link href="/catalog/products" className="underline">
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <div className="mt-6 divide-y divide-slate-200 border border-slate-200 rounded-lg">
          {deals.map((d) => {
            const isBuyer = d.buyerId === uid;
            return (
              <div key={d.id} className="flex items-center justify-between p-4">
                <Link href={`/dashboard/deals/${d.id}`} className="group">
                  <div className="font-medium text-slate-900 group-hover:underline">
                    {d.listing.title}
                  </div>
                  <div className="text-sm text-slate-500">
                    {d.orderNumber} · {d.amountRub.toLocaleString("ru-RU")} ₽ ·{" "}
                    {isBuyer ? "покупка" : "продажа"}
                  </div>
                </Link>
                <div className="flex items-center gap-3">
                  <span className="text-xs rounded-full bg-slate-100 px-3 py-1 text-slate-600">
                    {STATUS[d.status] ?? d.status}
                  </span>
                  {isBuyer && d.status === "PAID" && (
                    <ConfirmReceiptButton dealId={d.id} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
