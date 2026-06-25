import Link from "next/link";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {c.href ? (
            <Link href={c.href} className="hover:text-white">
              {c.label}
            </Link>
          ) : (
            <span className="text-slate-300">{c.label}</span>
          )}
          {i < items.length - 1 && <span className="text-slate-600">/</span>}
        </span>
      ))}
    </nav>
  );
}
