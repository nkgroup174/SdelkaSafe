import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { categoryName } from "@/lib/constants";
import { RemoveCompareButton } from "@/components/RemoveCompareButton";

export const dynamic = "force-dynamic";

const UNIT: Record<string, string> = {
  HOUR: "за час",
  DAY: "за день",
  PROJECT: "за проект",
  MONTH: "за месяц",
};

export default async function ComparePage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const items = await prisma.comparisonItem.findMany({
    where: { userId: session.user.id },
    include: { listing: true },
    orderBy: { addedAt: "asc" },
  });
  const listings = items.map((i) => i.listing);

  return (
    <div className="container-page py-10">
      <h1 className="text-2xl font-bold text-white">Сравнение</h1>

      {listings.length === 0 ? (
        <p className="mt-4 text-slate-400">
          Добавьте объявления к сравнению из{" "}
          <Link href="/catalog/products" className="underline">
            каталога
          </Link>
          .
        </p>
      ) : (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full border-separate border-spacing-0 text-sm">
            <tbody>
              <Row label="">
                {listings.map((l) => (
                  <td key={l.id} className="p-3 align-top border-b border-white/10">
                    <Link href={`/listing/${l.id}`} className="font-medium text-white hover:underline">
                      {l.title}
                    </Link>
                    <div className="mt-1">
                      <RemoveCompareButton listingId={l.id} />
                    </div>
                  </td>
                ))}
              </Row>
              <Row label="Цена">
                {listings.map((l) => (
                  <Cell key={l.id}>{l.priceRub.toLocaleString("ru-RU")} ₽</Cell>
                ))}
              </Row>
              <Row label="Категория">
                {listings.map((l) => (
                  <Cell key={l.id}>{categoryName(l.category)}</Cell>
                ))}
              </Row>
              <Row label="Тип">
                {listings.map((l) => (
                  <Cell key={l.id}>{l.type === "PRODUCT" ? "Товар" : "Услуга"}</Cell>
                ))}
              </Row>
              <Row label="Бренд / Расчёт">
                {listings.map((l) => (
                  <Cell key={l.id}>
                    {l.type === "PRODUCT" ? l.brand ?? "—" : UNIT[l.unit ?? ""] ?? "—"}
                  </Cell>
                ))}
              </Row>
              <Row label="Остаток / Срок">
                {listings.map((l) => (
                  <Cell key={l.id}>
                    {l.type === "PRODUCT"
                      ? l.stock != null
                        ? String(l.stock)
                        : "—"
                      : l.duration ?? "—"}
                  </Cell>
                ))}
              </Row>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr>
      <th className="p-3 text-left align-top text-slate-400 font-normal border-b border-white/10 whitespace-nowrap">
        {label}
      </th>
      {children}
    </tr>
  );
}

function Cell({ children }: { children: React.ReactNode }) {
  return <td className="p-3 align-top text-slate-200 border-b border-white/10">{children}</td>;
}
