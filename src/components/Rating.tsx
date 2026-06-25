export function Rating({
  value,
  count,
  size = "sm",
}: {
  value: number;
  count?: number;
  size?: "sm" | "lg";
}) {
  const full = Math.round(value);
  return (
    <span className="inline-flex items-center gap-1">
      <span className={size === "lg" ? "text-xl" : "text-sm"}>
        <span className="text-amber-400">{"★".repeat(full)}</span>
        <span className="text-slate-600">{"★".repeat(5 - full)}</span>
      </span>
      <span className={size === "lg" ? "text-base text-slate-300" : "text-xs text-slate-400"}>
        {value.toFixed(1)}
        {count != null && ` · ${count}`}
      </span>
    </span>
  );
}
