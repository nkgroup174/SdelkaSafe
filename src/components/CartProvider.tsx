"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  listingId: string;
  title: string;
  priceRub: number;
  imageUrl: string | null;
  supplierId: string;
  supplierName: string | null;
  qty: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (listingId: string, qty: number) => void;
  remove: (listingId: string) => void;
  clear: () => void;
  has: (listingId: string) => boolean;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "ss_cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* noop */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, loaded]);

  const add: CartCtx["add"] = (item, qty = 1) =>
    setItems((prev) => {
      const ex = prev.find((i) => i.listingId === item.listingId);
      if (ex) {
        return prev.map((i) =>
          i.listingId === item.listingId ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...item, qty }];
    });

  const setQty: CartCtx["setQty"] = (listingId, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.listingId === listingId ? { ...i, qty: Math.max(1, qty) } : i))
    );

  const remove: CartCtx["remove"] = (listingId) =>
    setItems((prev) => prev.filter((i) => i.listingId !== listingId));

  const clear = () => setItems([]);
  const has = (listingId: string) => items.some((i) => i.listingId === listingId);
  const count = items.reduce((s, i) => s + i.qty, 0);

  return (
    <Ctx.Provider value={{ items, count, add, setQty, remove, clear, has }}>
      {children}
    </Ctx.Provider>
  );
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
