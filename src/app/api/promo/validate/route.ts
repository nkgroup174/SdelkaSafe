import { NextResponse } from "next/server";
import { checkPromo } from "@/lib/promo";

// GET /api/promo/validate?code=SALE&amountRub=10000
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") ?? "";
  const amountRub = Number(searchParams.get("amountRub"));
  if (!code || !amountRub || amountRub <= 0) {
    return NextResponse.json({ valid: false, reason: "Некорректные данные" });
  }
  const result = await checkPromo(code, amountRub);
  return NextResponse.json(result);
}
