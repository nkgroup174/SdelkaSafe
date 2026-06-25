"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { type Category, subcategoriesFor } from "@/lib/constants";

type Props = {
  type: "PRODUCT" | "SERVICE";
  categories: Category[];
  initial: {
    q?: string;
    category?: string;
    subcategory?: string;
    brand?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
  };
};

const SORTS: { value: string; label: string; productsOnly?: boolean }[] = [
  { value: "new", label: "Сначала новые" },
  { value: "old", label: "Сначала старые" },
  { value: "price_asc", label: "Цена: по возрастанию" },
  { value: "price_desc", label: "Цена: по убыванию" },
  { value: "title_asc", label: "Название: А-Я" },
  { value: "title_desc", label: "Название: Я-А" },
  { value: "verified", label: "Сначала проверенные" },
  { value: "brand_asc", label: "Бренд: А-Я", productsOnly: true },
  { value: "brand_desc", label: "Бренд: Я-А", productsOnly: true },
];

export function FilterPanel({ type, categories, initial }: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [q, setQ] = useState(initial.q ?? "");
  const [category, setCategory] = useState(initial.category ?? "");
  const [subcategory, setSubcategory] = useState(initial.subcategory ?? "");
  const [brand, setBrand] = useState(initial.brand ?? "");
  const [minPrice, setMin] = useState(initial.minPrice ?? "");
  const [maxPrice, setMax] = useState(initial.maxPrice ?? "");
  const [sort, setSort] = useState(initial.sort ?? "new");

  function apply(next?: Partial<Record<string, string>>) {
    const v = {
      q,
      category,
      subcategory,
      brand: type === "PRODUCT" ? brand : "",
      minPrice,
      maxPrice,
      sort,
      ...next,
    };
    const sp = new URLSearchParams();
    if (v.q) sp.set("q", v.q);
    if (v.category) sp.set("category", v.category);
    if (v.subcategory) sp.set("subcategory", v.subcategory);
    if (v.brand) sp.set("brand", v.brand);
    if (v.minPrice) sp.set("minPrice", v.minPrice);
    if (v.maxPrice) sp.set("maxPrice", v.maxPrice);
    if (v.sort && v.sort !== "new") sp.set("sort", v.sort);
    const s = sp.toString();
    router.push(`${pathname}${s ? `?${s}` : ""}`);
  }

  function reset() {
    setQ(""); setCategory(""); setSubcategory(""); setBrand(""); setMin(""); setMax(""); setSort("new");
    router.push(pathname);
  }

  const subs = subcategoriesFor(category);

  const sorts = SORTS.filter((s) => !s.productsOnly || type === "PRODUCT");

  return (
    <div className="card p-5">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          apply();
        }}
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Поиск">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Название или описание…"
              className="input"
            />
          </Field>
          <Field label="Категория">
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setSubcategory("");
                apply({ category: e.target.value, subcategory: "" });
              }}
              className="input"
            >
              <option value="">Все категории</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          {subs.length > 0 && (
            <Field label="Подкатегория">
              <select
                value={subcategory}
                onChange={(e) => {
                  setSubcategory(e.target.value);
                  apply({ subcategory: e.target.value });
                }}
                className="input"
              >
                <option value="">Все подкатегории</option>
                {subs.map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
          )}
          {type === "PRODUCT" && (
            <Field label="Бренд">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Например: Bosch, Samsung…"
                className="input"
              />
            </Field>
          )}
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Field label="Мин. цена">
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMin(e.target.value)}
              placeholder="От"
              className="input"
            />
          </Field>
          <Field label="Макс. цена">
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMax(e.target.value)}
              placeholder="До"
              className="input"
            />
          </Field>
          <Field label="Сортировка">
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                apply({ sort: e.target.value });
              }}
              className="input"
            >
              {sorts.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn btn-primary">Применить</button>
          <button type="button" onClick={reset} className="btn btn-outline">Сбросить</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm text-slate-400">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
