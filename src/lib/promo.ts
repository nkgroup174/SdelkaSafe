import { prisma } from "./prisma";

type PromoLike = {
  type: "PERCENT" | "FIXED";
  value: number;
  minOrderRub: number;
  maxUses: number | null;
  usedCount: number;
  isActive: boolean;
  expiresAt: Date | null;
};

export function discountFor(promo: PromoLike, amountRub: number): number {
  const raw = promo.type === "PERCENT" ? (amountRub * promo.value) / 100 : promo.value;
  const capped = Math.min(raw, amountRub);
  return Math.round(capped * 100) / 100;
}

export type PromoCheck =
  | { valid: true; discountRub: number; promoId: string }
  | { valid: false; reason: string };

/** Проверяет промокод и возвращает скидку для суммы заказа. */
export async function checkPromo(
  code: string,
  amountRub: number
): Promise<PromoCheck> {
  const promo = await prisma.promoCode.findUnique({
    where: { code: code.trim().toUpperCase() },
  });
  if (!promo || !promo.isActive) return { valid: false, reason: "Промокод не найден" };
  if (promo.expiresAt && promo.expiresAt < new Date())
    return { valid: false, reason: "Срок действия истёк" };
  if (promo.maxUses != null && promo.usedCount >= promo.maxUses)
    return { valid: false, reason: "Лимит использований исчерпан" };
  if (amountRub < promo.minOrderRub)
    return {
      valid: false,
      reason: `Минимальная сумма заказа ${promo.minOrderRub.toLocaleString("ru-RU")} ₽`,
    };
  return { valid: true, discountRub: discountFor(promo, amountRub), promoId: promo.id };
}
