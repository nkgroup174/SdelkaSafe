import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Поставщики по городам",
  description: "Каталог проверенных поставщиков SdelkaSafe по городам.",
};

export default async function SuppliersPage() {
  const suppliers = await prisma.user.findMany({
    where: { role: "SUPPLIER", isBlocked: false },
    select: { id: true, name: true, city: true, isVerified: true },
    orderBy: { name: "asc" },
  });

  // группируем по городам
  const byCity = new Map<string, typeof suppliers>();
  for (const s of suppliers) {
    const city = s.city?.trim() || "Без города";
    const arr = byCity.get(city) ?? [];
    arr.push(s);
    byCity.set(city, arr);
  }
  const cities = [...byCity.entries()].sort((a, b) => b[1].length - a[1].length);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-white">Поставщики по городам</h1>
      <p className="mt-1 text-slate-400">Всего поставщиков: {suppliers.length}</p>

      {suppliers.length === 0 ? (
        <p className="mt-6 text-slate-400">Пока нет поставщиков.</p>
      ) : (
        <div className="mt-8 space-y-8">
          {cities.map(([city, list]) => (
            <div key={city}>
              <h2 className="text-lg font-semibold text-white">
                {city} <span className="text-slate-500 text-sm">({list.length})</span>
              </h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <Link key={s.id} href={`/supplier/${s.id}`} className="card card-hover p-4">
                    <div className="font-medium text-white">
                      {s.name ?? "Поставщик"}
                      {s.isVerified && <span className="ml-1 text-emerald-400">✓</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
