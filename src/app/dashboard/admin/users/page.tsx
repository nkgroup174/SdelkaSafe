import { redirect } from "next/navigation";
import Link from "next/link";
import type { Prisma } from "@prisma/client";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AdminUserCreate } from "@/components/AdminUserCreate";
import { AdminUserActions } from "@/components/AdminUserActions";
import { SearchBox } from "@/components/SearchBox";

export const dynamic = "force-dynamic";

const PER = 20;
const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "Заказчик",
  SUPPLIER: "Поставщик",
  ADMIN: "Админ",
};

export default async function AdminUsers({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const { q, page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const where: Prisma.UserWhereInput = q
    ? {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PER,
      take: PER,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isBlocked: true,
        isVerified: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  const totalPages = Math.ceil(total / PER);

  const qs = (p: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return `/dashboard/admin/users${s ? `?${s}` : ""}`;
  };

  return (
    <div className="container-page py-10 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Пользователи ({total})</h1>
        <div className="flex gap-2">
          <Link href="/dashboard/admin" className="btn btn-outline">Модерация</Link>
          <Link href="/dashboard/admin/promo" className="btn btn-outline">Промокоды</Link>
        </div>
      </div>

      <div className="mt-6">
        <AdminUserCreate />
      </div>

      <div className="mt-6 max-w-lg">
        <SearchBox placeholder="Поиск по email или имени…" />
      </div>

      <div className="mt-6 space-y-3">
        {users.length === 0 ? (
          <p className="text-slate-400">Ничего не найдено.</p>
        ) : (
          users.map((u) => (
            <div key={u.id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-medium text-white">
                  {u.name ?? "—"}{" "}
                  {u.isBlocked && <span className="badge ml-1 text-red-400">заблокирован</span>}
                  {u.isVerified && <span className="badge ml-1 text-emerald-400">✓</span>}
                </div>
                <div className="text-sm text-slate-500">
                  {u.email} · {ROLE_LABEL[u.role]} · с {u.createdAt.toLocaleDateString("ru-RU")}
                </div>
              </div>
              <AdminUserActions
                id={u.id}
                role={u.role}
                isBlocked={u.isBlocked}
                isSelf={u.id === session.user.id}
              />
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-3 text-sm">
          {page > 1 ? (
            <Link href={qs(page - 1)} className="btn btn-outline">← Назад</Link>
          ) : (
            <span className="btn btn-outline opacity-40 pointer-events-none">← Назад</span>
          )}
          <span className="text-slate-400">Стр. {page} из {totalPages}</span>
          {page < totalPages ? (
            <Link href={qs(page + 1)} className="btn btn-outline">Вперёд →</Link>
          ) : (
            <span className="btn btn-outline opacity-40 pointer-events-none">Вперёд →</span>
          )}
        </div>
      )}
    </div>
  );
}
