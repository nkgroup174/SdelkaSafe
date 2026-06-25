import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ResolveButton } from "@/components/ResolveButton";

export const dynamic = "force-dynamic";

export default async function AdminReports() {
  const session = await getSession();
  if (!session?.user) redirect("/auth/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const reports = await prisma.report.findMany({
    where: { resolved: false },
    include: {
      listing: { select: { id: true, title: true } },
      reporter: { select: { email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="container-page py-10 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold text-white">Жалобы ({reports.length})</h1>
        <Link href="/dashboard/admin" className="btn btn-outline">Модерация</Link>
      </div>

      {reports.length === 0 ? (
        <p className="mt-6 text-slate-400">Новых жалоб нет.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card p-4 flex items-start justify-between gap-3 flex-wrap">
              <div>
                <Link href={`/listing/${r.listing.id}`} className="font-medium text-white hover:underline">
                  {r.listing.title}
                </Link>
                <p className="mt-1 text-sm text-slate-300">{r.reason}</p>
                <p className="mt-1 text-xs text-slate-500">
                  от {r.reporter.email} · {r.createdAt.toLocaleString("ru-RU")}
                </p>
              </div>
              <ResolveButton url={`/api/admin/reports/${r.id}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
