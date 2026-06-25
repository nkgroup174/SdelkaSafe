import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gradient">{value}</div>
    </div>
  );
}

export default async function StatsPage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  const uid = session.user.id;
  const isSupplier = session.user.role === "SUPPLIER" || session.user.role === "ADMIN";

  if (isSupplier) {
    const [listings, views, dealsTotal, dealsDone, revenue] = await Promise.all([
      prisma.listing.count({ where: { supplierId: uid, status: "APPROVED" } }),
      prisma.viewHistory.count({ where: { listing: { supplierId: uid } } }),
      prisma.deal.count({ where: { sellerId: uid } }),
      prisma.deal.count({ where: { sellerId: uid, status: "COMPLETED" } }),
      prisma.deal.aggregate({
        where: { sellerId: uid, status: "COMPLETED" },
        _sum: { amountRub: true },
      }),
    ]);
    const conv = views > 0 ? ((dealsTotal / views) * 100).toFixed(1) : "0";
    const rev = revenue._sum.amountRub ?? 0;

    return (
      <div className="container-page py-10">
        <h1 className="text-2xl font-bold text-white">Статистика поставщика</h1>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard label="Активных объявлений" value={String(listings)} />
          <StatCard label="Просмотров" value={String(views)} />
          <StatCard label="Заявок всего" value={String(dealsTotal)} />
          <StatCard label="Завершённых сделок" value={String(dealsDone)} />
          <StatCard label="Конверсия (заявки/просмотры)" value={`${conv}%`} />
          <StatCard label="Выручка (завершённые)" value={`${rev.toLocaleString("ru-RU")} ₽`} />
        </div>
      </div>
    );
  }

  // Заказчик
  const [dealsTotal, dealsDone, spent] = await Promise.all([
    prisma.deal.count({ where: { buyerId: uid } }),
    prisma.deal.count({ where: { buyerId: uid, status: "COMPLETED" } }),
    prisma.deal.aggregate({
      where: { buyerId: uid, status: "COMPLETED" },
      _sum: { amountRub: true },
    }),
  ]);
  const spentRub = spent._sum.amountRub ?? 0;

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-white">Моя статистика</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Сделок всего" value={String(dealsTotal)} />
        <StatCard label="Завершённых" value={String(dealsDone)} />
        <StatCard label="Потрачено" value={`${spentRub.toLocaleString("ru-RU")} ₽`} />
      </div>
    </div>
  );
}
