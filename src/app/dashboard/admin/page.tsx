import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/constants";
import { AdminModerationList } from "@/components/AdminModerationList";

export const dynamic = "force-dynamic";

export default async function AdminModeration() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const pending = await prisma.listing.findMany({
    where: { status: "PENDING" },
    include: { supplier: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const items = pending.map((l) => ({
    id: l.id,
    title: l.title,
    typeLabel: l.type === "PRODUCT" ? "Товар" : "Услуга",
    category: categoryName(l.category),
    priceRub: l.priceRub,
    supplier: l.supplier.name ?? l.supplier.email,
  }));

  return (
    <div className="container-page py-10 max-w-4xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Модерация объявлений</h1>
        <Link href="/dashboard/admin/analytics" className="btn btn-outline">
          Аналитика
        </Link>
        <Link href="/dashboard/admin/users" className="btn btn-outline">
          Пользователи
        </Link>
        <Link href="/dashboard/admin/promo" className="btn btn-outline">
          Промокоды
        </Link>
      </div>
      <p className="mt-1 text-slate-400">На проверке: {items.length}</p>

      <AdminModerationList items={items} />
    </div>
  );
}
