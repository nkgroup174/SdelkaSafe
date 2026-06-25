"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Кнопки «в избранное» и «к сравнению» на карточке объявления.
export function ListingButtons({ listingId }: { listingId: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [fav, setFav] = useState(false);
  const [cmp, setCmp] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/favorites")
      .then((r) => r.json())
      .then((d) => setFav((d.ids ?? []).includes(listingId)));
    fetch("/api/compare")
      .then((r) => r.json())
      .then((d) => setCmp((d.ids ?? []).includes(listingId)));
  }, [session, listingId]);

  async function toggleFav() {
    if (!session?.user) return router.push("/auth/login");
    const res = await fetch("/api/favorites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const d = await res.json();
    setFav(Boolean(d.favorited));
  }

  async function toggleCmp() {
    if (!session?.user) return router.push("/auth/login");
    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId }),
    });
    const d = await res.json();
    if (!res.ok) {
      setMsg(d.error ?? "Ошибка");
      return;
    }
    setCmp(Boolean(d.added));
    setMsg("");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-2">
        <button onClick={toggleFav} className="btn btn-outline flex-1">
          {fav ? "♥ В избранном" : "♡ В избранное"}
        </button>
        <button onClick={toggleCmp} className="btn btn-outline flex-1">
          {cmp ? "✓ В сравнении" : "+ К сравнению"}
        </button>
      </div>
      {msg && <p className="text-xs text-amber-400">{msg}</p>}
    </div>
  );
}
