import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/constants";
import { ListingActions } from "@/components/ListingActions";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Черновик",
  PENDING: "На модерации",
  APPROVED: "Опубликовано",
  REJECTED: "Отклонено",
  ARCHIVED: "В архиве",
};

export default async function SupplierListings() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "SUPPLIER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const listings = await prisma.listing.findMany({
    where: { supplierId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Мои объявления</h1>
        <div className="flex gap-2">
          <Link
            href="/dashboard/supplier/import"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Импорт CSV
          </Link>
          <Link
            href="/dashboard/supplier/new"
            className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800"
          >
            + Добавить
          </Link>
        </div>
      </div>

      {listings.length === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-slate-300 p-10 text-center text-slate-400">
          Объявлений пока нет. Нажмите «Добавить».
        </div>
      ) : (
        <div className="mt-6 divide-y divide-slate-200 border border-slate-200 rounded-lg">
          {listings.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <div className="font-medium text-slate-900">{l.title}</div>
                <div className="text-sm text-slate-500">
                  {l.type === "PRODUCT" ? "Товар" : "Услуга"} ·{" "}
                  {categoryName(l.category)} · {l.priceRub.toLocaleString("ru-RU")} ₽
                  <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                    {STATUS_LABEL[l.status] ?? l.status}
                  </span>
                </div>
              </div>
              <ListingActions id={l.id} status={l.status} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
