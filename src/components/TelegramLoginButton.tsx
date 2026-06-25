"use client";

import { useEffect, useRef, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

const BOT = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME;

// Telegram Login Widget для входа на сайте (в обычном браузере).
// Виджет Telegram работает только на реальном домене (через /setdomain в @BotFather),
// поэтому на localhost его прячем и показываем подсказку.
export function TelegramLoginButton() {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const host = window.location.hostname;
    const isLocal =
      host === "localhost" || host === "127.0.0.1" || host.endsWith(".local");
    setEnabled(Boolean(BOT) && !isLocal);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    (window as unknown as Record<string, unknown>).onTelegramAuth = async (
      user: Record<string, string>
    ) => {
      const res = await signIn("telegram", {
        widget: JSON.stringify(user),
        redirect: false,
      });
      if (!res?.error) {
        router.push("/dashboard");
        router.refresh();
      }
    };

    const container = ref.current;
    if (!container) return;
    container.innerHTML = "";
    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.async = true;
    script.setAttribute("data-telegram-login", BOT ?? "");
    script.setAttribute("data-size", "large");
    script.setAttribute("data-radius", "8");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [enabled, router]);

  if (enabled === null) return null; // ещё не определили окружение

  if (!enabled) {
    return (
      <p className="text-center text-xs text-slate-400">
        Вход через Telegram доступен на рабочем домене (sdelkasafe.ru) и в Telegram Mini App.
      </p>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" /> или{" "}
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <div className="mt-4 flex justify-center" ref={ref} />
    </>
  );
}
