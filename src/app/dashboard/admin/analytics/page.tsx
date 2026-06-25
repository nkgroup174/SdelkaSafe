import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { DigestButton } from "@/components/DigestButton";

export const dynamic = "force-dynamic";

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="card p-5">
      <div className="text-sm text-slate-400">{label}</div>
      <div className="mt-1 text-3xl font-bold text-gradient">{value}</div>
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm text-slate-300">
        <span>{label}</span>
        <span className="text-slate-500">{value}</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--grad-btn)" }} />
      </div>
    </div>
  );
}

export default async function AdminAnalytics() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    users, suppliers, customers, newUsers,
    products, services,
    pending, approved,
    dealsTotal, dealsPaid, dealsCompleted, dealsCancelled,
    gmv, commission,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: "SUPPLIER" } }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
    prisma.listing.count({ where: { type: "PRODUCT" } }),
    prisma.listing.count({ where: { type: "SERVICE" } }),
    prisma.listing.count({ where: { status: "PENDING" } }),
    prisma.listing.count({ where: { status: "APPROVED" } }),
    prisma.deal.count(),
    prisma.deal.count({ where: { status: "PAID" } }),
    prisma.deal.count({ where: { status: "COMPLETED" } }),
    prisma.deal.count({ where: { status: "CANCELLED" } }),
    prisma.deal.aggregate({ where: { status: "COMPLETED" }, _sum: { amountRub: true } }),
    prisma.deal.aggregate({ where: { status: "COMPLETED" }, _sum: { commissionRub: true } }),
  ]);

  const listingsTotal = products + services;

  return (
    <div className="container-page py-10 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Аналитика платформы</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/admin" className="btn btn-outline">Модерация</Link>
          <Link href="/dashboard/admin/users" className="btn btn-outline">Пользователи</Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Пользователей" value={String(users)} />
        <StatCard label="Новых за 7 дней" value={String(newUsers)} />
        <StatCard label="GMV (завершённые)" value={`${(gmv._sum.amountRub ?? 0).toLocaleString("ru-RU")} ₽`} />
        <StatCard label="Комиссия заработана" value={`${(commission._sum.commissionRub ?? 0).toLocaleString("ru-RU")} ₽`} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-3">
        <div className="card p-5 space-y-3">
          <div className="font-medium text-white">Пользователи</div>
          <Bar label="Поставщики" value={suppliers} total={users} />
          <Bar label="Заказчики" value={customers} total={users} />
        </div>
        <div className="card p-5 space-y-3">
          <div className="font-medium text-white">Объявления</div>
          <Bar label="Товары" value={products} total={listingsTotal} />
          <Bar label="Услуги" value={services} total={listingsTotal} />
          <Bar label="На модерации" value={pending} total={listingsTotal} />
          <Bar label="Опубликовано" value={approved} total={listingsTotal} />
        </div>
        <div className="card p-5 space-y-3">
          <div className="font-medium text-white">Сделки ({dealsTotal})</div>
          <Bar label="Оплачено" value={dealsPaid} total={dealsTotal} />
          <Bar label="Завершено" value={dealsCompleted} total={dealsTotal} />
          <Bar label="Отменено" value={dealsCancelled} total={dealsTotal} />
        </div>
      </div>

      <div className="mt-6 card p-5">
        <div className="font-medium text-white">Email-дайджест</div>
        <p className="mt-1 text-sm text-slate-400">
          Разослать подписчикам новинки за 7 дней по их категориям.
        </p>
        <div className="mt-3">
          <DigestButton />
        </div>
      </div>
    </div>
  );
}
