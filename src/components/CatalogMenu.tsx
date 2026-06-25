"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  PRODUCT_CATEGORIES,
  SERVICE_CATEGORIES,
  subcategoriesFor,
} from "@/lib/constants";

type Item = { type: "PRODUCT" | "SERVICE"; slug: string; name: string };

export function CatalogMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"PRODUCT" | "SERVICE">("PRODUCT");
  const [active, setActive] = useState<Item | null>(null);

  const products: Item[] = useMemo(
    () => PRODUCT_CATEGORIES.map((c) => ({ type: "PRODUCT" as const, ...c })),
    []
  );
  const services: Item[] = useMemo(
    () => SERVICE_CATEGORIES.map((c) => ({ type: "SERVICE" as const, ...c })),
    []
  );
  const list = tab === "PRODUCT" ? products : services;

  function switchTab(t: "PRODUCT" | "SERVICE") {
    setTab(t);
    setActive((t === "PRODUCT" ? products : services)[0]);
  }

  // закрытие по Esc + блокировка прокрутки фона
  useEffect(() => {
    if (!open) return;
    if (!active) setActive(products[0]);
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, active, products]);

  const base = (it: Item) =>
    it.type === "PRODUCT" ? "/catalog/products" : "/catalog/services";
  const subs = active ? subcategoriesFor(active.slug) : [];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-2 text-slate-300 hover:text-white flex items-center gap-1"
      >
        Каталог
        <span className="text-xs">▾</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:p-8">
          {/* затемнение */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* модальное окно */}
          <div className="relative w-full max-w-4xl max-h-[82vh] rounded-2xl border border-white/10 bg-[#0d0d22] shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
              <div className="flex gap-1 rounded-lg bg-white/5 p-1">
                <button
                  onClick={() => switchTab("PRODUCT")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                    tab === "PRODUCT" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Товары
                </button>
                <button
                  onClick={() => switchTab("SERVICE")}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium ${
                    tab === "SERVICE" ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                  }`}
                >
                  Услуги
                </button>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 rounded-md text-slate-400 hover:bg-white/10 hover:text-white text-lg"
                aria-label="Закрыть"
              >
                ×
              </button>
            </div>

            <div className="flex flex-1 min-h-0">
              {/* левая колонка — категории активной вкладки */}
              <div className="w-[44%] border-r border-white/10 p-2 overflow-y-auto">
                {list.map((it) => (
                  <Row key={it.slug} it={it} active={active} setActive={setActive} onClose={() => setOpen(false)} href={base(it)} />
                ))}
              </div>

              {/* правая колонка — подкатегории */}
              <div className="flex-1 p-5 overflow-y-auto">
                {active && (
                  <>
                    <Link
                      href={`${base(active)}?category=${active.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-lg font-bold text-white inline-flex items-center gap-1 hover:underline"
                    >
                      {active.name} <span className="text-slate-500">›</span>
                    </Link>
                    {subs.length > 0 ? (
                      <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
                        {subs.map((s) => (
                          <li key={s.slug}>
                            <Link
                              href={`${base(active)}?category=${active.slug}&subcategory=${s.slug}`}
                              onClick={() => setOpen(false)}
                              className="text-sm text-slate-300 hover:text-white"
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-4 text-sm text-slate-500">
                        Подкатегорий нет —{" "}
                        <Link
                          href={`${base(active)}?category=${active.slug}`}
                          onClick={() => setOpen(false)}
                          className="text-slate-300 hover:text-white underline"
                        >
                          смотреть все объявления
                        </Link>
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function Row({
  it,
  active,
  setActive,
  onClose,
  href,
}: {
  it: Item;
  active: Item | null;
  setActive: (i: Item) => void;
  onClose: () => void;
  href: string;
}) {
  const isActive = active?.slug === it.slug && active?.type === it.type;
  return (
    <Link
      href={`${href}?category=${it.slug}`}
      onMouseEnter={() => setActive(it)}
      onClick={onClose}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm ${
        isActive ? "bg-white/10 text-white" : "text-slate-300 hover:bg-white/5"
      }`}
    >
      {it.name}
      <span className="text-slate-500">›</span>
    </Link>
  );
}
