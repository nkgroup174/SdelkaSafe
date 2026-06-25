import type { Metadata } from "next";
import "./globals.css";
import Script from "next/script";
import Link from "next/link";
import { Providers } from "./providers";
import { HeaderNav } from "@/components/HeaderNav";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "https://sdelkasafe.ru"),
  title: {
    default: "SdelkaSafe — оптовые сделки: товары и услуги",
    template: "%s — SdelkaSafe",
  },
  description:
    "Платформа оптовых сделок с оплатой в TON. Два каталога: товары и услуги. Безопасно, быстро, без банковских задержек.",
  openGraph: {
    title: "SdelkaSafe — оптовые сделки",
    description: "Безопасные B2B-сделки с оплатой в TON. Товары и услуги для бизнеса.",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col">
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="afterInteractive" />
        <Providers>
        <header className="border-b border-slate-200">
          <HeaderNav />
        </header>

        <main className="flex-1">{children}</main>

        <footer className="border-t border-white/10 section-alt">
          <div className="container-page py-12 grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center gap-2.5">
                <span className="logo-mark">S</span>
                <span className="font-bold text-gradient">SdelkaSafe</span>
              </Link>
              <p className="mt-3 text-sm text-slate-400 max-w-xs">
                Платформа оптовых сделок с защищёнными платежами в TON.
              </p>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Платформа</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link href="/catalog/products" className="hover:text-white">Каталог товаров</Link></li>
                <li><Link href="/catalog/services" className="hover:text-white">Каталог услуг</Link></li>
                <li><Link href="/suppliers" className="hover:text-white">Поставщики по городам</Link></li>
                <li><Link href="/auth/register" className="hover:text-white">Стать поставщиком</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Компания</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li><Link href="/about" className="hover:text-white">О нас</Link></li>
                <li><Link href="/contact" className="hover:text-white">Контакты</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-medium text-white">Оплата</div>
              <ul className="mt-3 space-y-2 text-sm text-slate-400">
                <li>Криптовалюта TON</li>
                <li>Покупка TON за рубли в Telegram Wallet</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10">
            <div className="container-page py-5 text-sm text-slate-500">
              © {new Date().getFullYear()} SdelkaSafe — оптовые сделки на TON
            </div>
          </div>
        </footer>
        </Providers>
      </body>
    </html>
  );
}
