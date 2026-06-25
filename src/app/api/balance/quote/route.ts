import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { rubToTon } from "@/lib/ton";
import { PLATFORM_TON_WALLET } from "@/lib/constants";

// GET /api/balance/quote?amountRub=1000 — пересчёт суммы пополнения в TON + адрес платформы
export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Требуется вход" }, { status: 401 });
  }
  const amountRub = Number(new URL(req.url).searchParams.get("amountRub"));
  if (!amountRub || amountRub <= 0) {
    return NextResponse.json({ error: "Некорректная сумма" }, { status: 400 });
  }
  const { ton, rate } = await rubToTon(amountRub, 0);
  return NextResponse.json({ amountTon: ton, rate, platformWallet: PLATFORM_TON_WALLET });
}
