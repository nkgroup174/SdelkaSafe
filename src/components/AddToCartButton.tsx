"use client";

import Link from "next/link";
import { useCart, type CartItem } from "@/components/CartProvider";

export function AddToCartButton({ item }: { item: Omit<CartItem, "qty"> }) {
  const { add, has } = useCart();
  const inCart = has(item.listingId);

  if (inCart) {
    return (
      <Link href="/cart" className="btn btn-outline w-full">
        ✓ В корзине — перейти
      </Link>
    );
  }
  return (
    <button onClick={() => add(item)} className="btn btn-outline w-full">
      🛒 В корзину
    </button>
  );
}
