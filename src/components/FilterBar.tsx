"use client";

import { useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  const [min, setMin] = useState(params.get("minPrice") ?? "");
  const [max, setMax] = useState(params.get("maxPrice") ?? "");
  const sort = params.get("sort") ?? "new";

  function apply(nextSort?: string) {
    const sp = new URLSearchParams(params.toString());
    min ? sp.set("minPrice", min) : sp.delete("minPrice");
    max ? sp.set("maxPrice", max) : sp.delete("maxPrice");
    const s = nextSort ?? sort;
    s && s !== "new" ? sp.set("sort", s) : sp.delete("sort");
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        type="number"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        placeholder="Цена от, ₽"
        className="input !w-32"
      />
      <input
        type="number"
        value={max}
        onChange={(e) => setMax(e.target.value)}
        placeholder="до, ₽"
        className="input !w-32"
      />
      <button onClick={() => apply()} className="btn btn-outline">
        Применить
      </button>
      <select
        value={sort}
        onChange={(e) => apply(e.target.value)}
        className="input !w-auto ml-auto"
      >
        <option value="new">Сначала новые</option>
        <option value="price_asc">Сначала дешевле</option>
        <option value="price_desc">Сначала дороже</option>
      </select>
    </div>
  );
}
