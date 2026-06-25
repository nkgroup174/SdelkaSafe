"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function BrandFilter({ brands, active }: { brands: string[]; active?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();

  if (brands.length === 0) return null;

  function pick(value: string) {
    const sp = new URLSearchParams(params.toString());
    value ? sp.set("brand", value) : sp.delete("brand");
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <select
      value={active ?? ""}
      onChange={(e) => pick(e.target.value)}
      className="input !w-auto"
    >
      <option value="">Все бренды</option>
      {brands.map((b) => (
        <option key={b} value={b}>
          {b}
        </option>
      ))}
    </select>
  );
}
