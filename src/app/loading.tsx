export default function Loading() {
  return (
    <div className="container-page py-28 flex items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <span className="inline-block h-5 w-5 rounded-full border-2 border-white/20 border-t-white/70 animate-spin" />
        Загрузка…
      </div>
    </div>
  );
}
