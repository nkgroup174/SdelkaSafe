import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { TopUpBox } from "@/components/TopUpBox";

export const dynamic = "force-dynamic";

const TX_LABEL: Record<string, string> = {
  DEPOSIT: "Пополнение",
  COMMISSION: "Комиссия",
  REFUND: "Возврат",
  ADJUSTMENT: "Корректировка",
};

export default async function BalancePage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "SUPPLIER" && session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const [user, txs] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { balanceRub: true },
    }),
    prisma.balanceTransaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  return (
    <div className="container-page py-10 grid md:grid-cols-[1fr_340px] gap-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Баланс комиссий</h1>
        <div className="mt-4 card p-6">
          <div className="text-sm text-slate-400">Текущий баланс</div>
          <div className="mt-1 text-4xl font-bold text-gradient">
            {(user?.balanceRub ?? 0).toLocaleString("ru-RU")} ₽
          </div>
          {(user?.balanceRub ?? 0) < 0 && (
            <p className="mt-2 text-sm text-amber-400">
              Баланс отрицательный — пополните, чтобы покрыть комиссии по сделкам.
            </p>
          )}
        </div>

        <h2 className="mt-8 text-lg font-semibold text-white">История операций</h2>
        {txs.length === 0 ? (
          <p className="mt-3 text-slate-400">Операций пока нет.</p>
        ) : (
          <div className="mt-4 divide-y divide-white/10 border border-white/10 rounded-xl overflow-hidden">
            {txs.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-4">
                <div>
                  <div className="text-sm text-white">{TX_LABEL[t.type] ?? t.type}</div>
                  <div className="text-xs text-slate-500">
                    {t.createdAt.toLocaleString("ru-RU")}
                    {t.note ? ` · ${t.note}` : ""}
                  </div>
                </div>
                <div
                  className={`font-medium ${
                    t.amountRub >= 0 ? "text-emerald-400" : "text-slate-300"
                  }`}
                >
                  {t.amountRub >= 0 ? "+" : ""}
                  {t.amountRub.toLocaleString("ru-RU")} ₽
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <aside>
        <TopUpBox />
      </aside>
    </div>
  );
}
