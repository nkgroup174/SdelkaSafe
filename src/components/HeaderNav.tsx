"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { CatalogMenu } from "@/components/CatalogMenu";
import { useCart } from "@/components/CartProvider";

export function HeaderNav() {
  const { data: session, status } = useSession();
  const { count } = useCart();
  const [avatar, setAvatar] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/users/profile")
      .then((r) => r.json())
      .then((d) => setAvatar(d.user?.avatarUrl ?? null))
      .catch(() => {});
  }, [status]);

  const authed = status === "authenticated";

  return (
    <>
      <nav className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
          <span className="logo-mark">S</span>
          <span className="text-lg font-bold text-gradient">SdelkaSafe</span>
        </Link>

        {/* Десктоп */}
        <div className="hidden sm:flex items-center gap-1 sm:gap-2 text-sm">
          <CatalogMenu />
          <Link href="/suppliers" className="hidden md:inline px-3 py-2 text-slate-300 hover:text-white">Поставщики</Link>
          <Link href="/about" className="hidden md:inline px-3 py-2 text-slate-300 hover:text-white">О нас</Link>
          <Link href="/cart" className="relative px-3 py-2 text-slate-300 hover:text-white">
            🛒
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full text-[11px] text-white flex items-center justify-center px-1" style={{ background: "var(--grad-btn)" }}>
                {count}
              </span>
            )}
          </Link>
          {authed ? (
            <>
              <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 text-slate-300 hover:text-white">
                {avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" className="h-7 w-7 rounded-full object-cover border border-white/15" />
                ) : (
                  <span className="h-7 w-7 rounded-full bg-white/10 flex items-center justify-center text-xs">
                    {(session.user.name ?? session.user.email ?? "?").slice(0, 1).toUpperCase()}
                  </span>
                )}
                Кабинет
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-outline">Выйти</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="px-3 py-2 text-slate-300 hover:text-white">Войти</Link>
              <Link href="/auth/register" className="btn btn-primary">Начать</Link>
            </>
          )}
        </div>

        {/* Бургер для мобильных */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="sm:hidden flex flex-col gap-1.5 p-2"
          aria-label="Меню"
        >
          <span className="block h-0.5 w-6 bg-slate-200" />
          <span className="block h-0.5 w-6 bg-slate-200" />
          <span className="block h-0.5 w-6 bg-slate-200" />
        </button>
      </nav>

      {/* Мобильное выпадающее меню */}
      {open && (
        <div className="sm:hidden border-t border-white/10 bg-[#0a0a1a]">
          <div className="container-page py-3 flex flex-col gap-1 text-sm">
            <Link href="/catalog/products" onClick={() => setOpen(false)} className="py-2 text-slate-300">Товары</Link>
            <Link href="/catalog/services" onClick={() => setOpen(false)} className="py-2 text-slate-300">Услуги</Link>
            <Link href="/about" onClick={() => setOpen(false)} className="py-2 text-slate-300">О нас</Link>
            <Link href="/cart" onClick={() => setOpen(false)} className="py-2 text-slate-300">
              Корзина{count > 0 ? ` (${count})` : ""}
            </Link>
            {authed ? (
              <>
                <Link href="/dashboard" onClick={() => setOpen(false)} className="py-2 text-slate-300">Кабинет</Link>
                <button onClick={() => signOut({ callbackUrl: "/" })} className="btn btn-outline mt-2">Выйти</button>
              </>
            ) : (
              <>
                <Link href="/auth/login" onClick={() => setOpen(false)} className="py-2 text-slate-300">Войти</Link>
                <Link href="/auth/register" onClick={() => setOpen(false)} className="btn btn-primary mt-2">Начать</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
