import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "@/components/ProfileForm";
import { ChangePasswordForm } from "@/components/ChangePasswordForm";
import { EmailVerify } from "@/components/EmailVerify";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      name: true,
      phone: true,
      tonWallet: true,
      avatarUrl: true,
      about: true,
      city: true,
      website: true,
      inn: true,
      ogrn: true,
      email: true,
      role: true,
      balanceRub: true,
      emailVerified: true,
      referralCode: true,
      _count: { select: { referrals: true } },
    },
  });
  if (!user) redirect("/auth/login");

  // Ленивая генерация реферального кода
  let referralCode = user.referralCode;
  if (!referralCode) {
    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: { referralCode: Math.random().toString(36).slice(2, 10).toUpperCase() },
      select: { referralCode: true },
    });
    referralCode = updated.referralCode;
  }
  const refLink = `${process.env.APP_URL || "https://sdelkasafe.ru"}/auth/register?ref=${referralCode}`;

  return (
    <div className="container-page py-10 max-w-xl">
      <h1 className="text-2xl font-bold text-white">Профиль</h1>
      <p className="mt-1 text-slate-400">
        {user.email}{" "}
        {user.emailVerified ? (
          <span className="badge text-emerald-400">email подтверждён</span>
        ) : (
          <span className="badge text-amber-400">email не подтверждён</span>
        )}
      </p>

      {user.role === "SUPPLIER" && (
        <Link href="/dashboard/balance" className="mt-4 block card p-4 text-sm hover:bg-white/5">
          <div className="text-slate-400">Баланс для комиссий</div>
          <div className="text-lg font-semibold text-white">
            {user.balanceRub.toLocaleString("ru-RU")} ₽
          </div>
        </Link>
      )}

      <ProfileForm
        initial={{
          name: user.name ?? "",
          phone: user.phone ?? "",
          tonWallet: user.tonWallet ?? "",
          avatarUrl: user.avatarUrl ?? "",
          about: user.about ?? "",
          city: user.city ?? "",
          website: user.website ?? "",
          inn: user.inn ?? "",
          ogrn: user.ogrn ?? "",
        }}
        isSupplier={user.role === "SUPPLIER"}
      />

      {!user.emailVerified && (
        <div className="mt-10">
          <h2 className="text-lg font-semibold text-white">Подтверждение email</h2>
          <EmailVerify />
        </div>
      )}

      <div className="mt-10 card p-4">
        <h2 className="text-lg font-semibold text-white">Реферальная программа</h2>
        <p className="mt-1 text-sm text-slate-400">
          За каждого приглашённого — 100 ₽ на баланс. Приглашено: {user._count.referrals}.
        </p>
        <input readOnly value={refLink} className="input mt-3" />
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold text-white">Смена пароля</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}
