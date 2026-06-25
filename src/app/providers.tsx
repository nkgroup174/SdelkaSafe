"use client";

import { SessionProvider } from "next-auth/react";
import { TonConnectUIProvider } from "@tonconnect/ui-react";
import { CartProvider } from "@/components/CartProvider";

const MANIFEST_URL =
  process.env.NEXT_PUBLIC_TONCONNECT_MANIFEST_URL ??
  "https://sdelkasafe.ru/tonconnect-manifest.json";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <TonConnectUIProvider manifestUrl={MANIFEST_URL}>
        <CartProvider>{children}</CartProvider>
      </TonConnectUIProvider>
    </SessionProvider>
  );
}
