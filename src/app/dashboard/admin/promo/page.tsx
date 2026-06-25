import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PromoCreateForm } from "@/components/PromoCreateForm";
import { PromoRowActions } from "@/components/PromoRowActions";

export const dynamic = "force-dynamic";

export default async function AdminPromo() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const codes = await prisma.promoCode.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="container-page py-10 max-w-3xl">
      <h1 className="text-2xl font-bold text-white">Промокоды</h1>

      <div className="mt-6">
        <PromoCreateForm />
      </div>

      <div className="mt-8 space-y-3">
        {codes.length === 0 ? (
          <p className="text-slate-400">Промокодов пока нет.</p>
        ) : (
          codes.map((c) => (
            <div key={c.id} className="card p-4 flex items-center justify-between flex-wrap gap-3">
              <div>
                <div className="font-medium text-white">
                  {c.code}{" "}
                  <span className="badge ml-1">
                    {c.type === "PERCENT" ? `${c.value}%` : `${c.value} ₽`}
                  </span>
                  {!c.isActive && <span className="badge ml-1 text-red-400">выключен</span>}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Использован: {c.usedCount}
                  {c.maxUses ? ` / ${c.maxUses}` : ""}
                  {c.minOrderRub > 0 && ` · от ${c.minOrderRub.toLocaleString("ru-RU")} ₽`}
                  {c.expiresAt && ` · до ${c.expiresAt.toLocaleDateString("ru-RU")}`}
                </div>
              </div>
              <PromoRowActions id={c.id} isActive={c.isActive} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
