import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ResolveDisputeButtons } from "@/components/DisputeButtons";

export const dynamic = "force-dynamic";

export default async function AdminDisputes() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const disputes = await prisma.deal.findMany({
    where: { status: "DISPUTED" },
    include: {
      listing: { select: { title: true } },
      buyer: { select: { email: true } },
      seller: { select: { email: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="container-page py-10 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Споры ({disputes.length})</h1>
        <Link href="/dashboard/admin" className="btn btn-outline">Модерация</Link>
      </div>

      {disputes.length === 0 ? (
        <p className="mt-6 text-slate-400">Открытых споров нет.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {disputes.map((d) => (
            <div key={d.id} className="card p-4 space-y-2">
              <div className="font-medium text-white">
                {d.listing.title}{" "}
                <span className="text-sm text-slate-500">
                  · {d.orderNumber} · {d.amountRub.toLocaleString("ru-RU")} ₽
                </span>
              </div>
              <div className="text-sm text-slate-400">
                Покупатель: {d.buyer.email} · Поставщик: {d.seller.email}
              </div>
              {d.disputeReason && (
                <p className="text-sm text-amber-300">Причина: {d.disputeReason}</p>
              )}
              <ResolveDisputeButtons dealId={d.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
