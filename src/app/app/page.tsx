"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

// Mini App: открывается внутри Telegram. Авторизация по initData.
export default function MiniApp() {
  const router = useRouter();
  const [msg, setMsg] = useState("Подключаемся к Telegram…");

  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      const tg = (window as unknown as { Telegram?: { WebApp?: any } })
        .Telegram?.WebApp;
      tries++;
      if (tg) {
        clearInterval(timer);
        tg.ready();
        tg.expand?.();
        const initData: string = tg.initData;
        if (!initData) {
          setMsg("Откройте приложение через кнопку в Telegram-боте.");
          return;
        }
        setMsg("Авторизация…");
        signIn("telegram", { initData, redirect: false }).then((res) => {
          if (res?.error) setMsg("Не удалось войти. Попробуйте ещё раз.");
          else {
            router.push("/dashboard");
            router.refresh();
          }
        });
      } else if (tries > 20) {
        clearInterval(timer);
        setMsg("Эта страница работает только внутри Telegram.");
      }
    }, 150);
    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="max-w-sm mx-auto px-4 py-20 text-center">
      <h1 className="text-xl font-semibold text-slate-900">SdelkaSafe</h1>
      <p className="mt-3 text-slate-600">{msg}</p>
    </div>
  );
}
