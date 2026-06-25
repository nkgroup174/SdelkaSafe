// Утилиты для работы с курсом TON.
// Платформа остаётся полностью в TON: цены храним в рублях, конвертируем в момент оплаты.

const TON_PRICE_URL =
  "https://api.coingecko.com/api/v3/simple/price?ids=the-open-network&vs_currencies=rub";

let cache: { rate: number; ts: number } | null = null;
const CACHE_MS = 60_000; // курс кэшируем на минуту

/** Текущий курс: сколько рублей за 1 TON. */
export async function getTonRateRub(): Promise<number> {
  if (cache && Date.now() - cache.ts < CACHE_MS) return cache.rate;
  try {
    const res = await fetch(TON_PRICE_URL, { next: { revalidate: 60 } });
    const data = await res.json();
    const rate = data?.["the-open-network"]?.rub;
    if (typeof rate === "number" && rate > 0) {
      cache = { rate, ts: Date.now() };
      return rate;
    }
  } catch {
    // упадём на запасной курс ниже
  }
  return cache?.rate ?? 300; // запасной курс на случай недоступности API
}

/** Перевод суммы из рублей в TON с небольшим запасом на волатильность. */
export async function rubToTon(amountRub: number, buffer = 0.01): Promise<{ ton: number; rate: number }> {
  const rate = await getTonRateRub();
  const ton = (amountRub / rate) * (1 + buffer);
  return { ton: Math.round(ton * 1e9) / 1e9, rate };
}
