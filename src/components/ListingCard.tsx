import Link from "next/link";
import { categoryName } from "@/lib/constants";

type Props = {
  id: string;
  title: string;
  category: string;
  priceRub: number;
  imageUrl: string | null;
  supplierName?: string | null;
  isVerified?: boolean;
  unit?: string | null;
  outOfStock?: boolean;
  isNew?: boolean;
  boosted?: boolean;
  oldPriceRub?: number | null;
};

const UNIT_LABEL: Record<string, string> = {
  HOUR: "/час",
  DAY: "/день",
  PROJECT: "/проект",
  MONTH: "/мес",
};

export function ListingCard(p: Props) {
  return (
    <Link href={`/listing/${p.id}`} className="card card-hover block overflow-hidden">

      <div className="relative aspect-[4/3] bg-slate-100 flex items-center justify-center text-slate-300">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm">нет фото</span>
        )}
        {p.outOfStock && (
          <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
            нет в наличии
          </span>
        )}
        {!p.outOfStock && p.oldPriceRub && p.oldPriceRub > p.priceRub && (
          <span className="absolute top-2 left-2 rounded-md bg-red-500 px-2 py-1 text-xs font-semibold text-white">
            −{Math.round((1 - p.priceRub / p.oldPriceRub) * 100)}%
          </span>
        )}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {p.boosted && (
            <span className="rounded-md px-2 py-0.5 text-[11px] font-medium text-white" style={{ background: "var(--grad-btn)" }}>
              Хит
            </span>
          )}
          {p.isNew && (
            <span className="rounded-md bg-emerald-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
              Новинка
            </span>
          )}
          {p.isVerified && (
            <span className="rounded-md bg-sky-500/90 px-2 py-0.5 text-[11px] font-medium text-white">
              Топ-поставщик
            </span>
          )}
        </div>
      </div>
      <div className="p-4">
        <div className="text-xs text-slate-500">{categoryName(p.category)}</div>
        <div className="mt-1 font-medium text-slate-900 line-clamp-2">{p.title}</div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-semibold text-slate-900">
            {p.priceRub.toLocaleString("ru-RU")} ₽
            {p.unit ? (
              <span className="text-sm font-normal text-slate-500">
                {UNIT_LABEL[p.unit] ?? ""}
              </span>
            ) : null}
          </span>
          {p.oldPriceRub && p.oldPriceRub > p.priceRub && (
            <span className="text-sm text-slate-500 line-through">
              {p.oldPriceRub.toLocaleString("ru-RU")} ₽
            </span>
          )}
        </div>
        {p.supplierName && (
          <div className="mt-1 text-xs text-slate-500">
            {p.supplierName}
            {p.isVerified && <span className="ml-1 text-emerald-600">✓ проверен</span>}
          </div>
        )}
      </div>
    </Link>
  );
}
