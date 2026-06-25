import Link from "next/link";
import type { Category } from "@/lib/constants";

export function CategoryFilter({
  basePath,
  categories,
  active,
}: {
  basePath: string;
  categories: Category[];
  active?: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Link
        href={basePath}
        className={`rounded-full px-3 py-1 text-sm border ${
          !active
            ? "border-slate-900 bg-slate-900 text-white"
            : "border-slate-300 text-slate-700 hover:bg-slate-50"
        }`}
      >
        Все
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`${basePath}?category=${c.slug}`}
          className={`rounded-full px-3 py-1 text-sm border ${
            active === c.slug
              ? "border-slate-900 bg-slate-900 text-white"
              : "border-slate-300 text-slate-700 hover:bg-slate-50"
          }`}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
