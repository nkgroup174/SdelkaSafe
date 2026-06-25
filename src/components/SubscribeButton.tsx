"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SubscribeButton({ category }: { category: string }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!session?.user) return;
    fetch("/api/subscriptions")
      .then((r) => r.json())
      .then((d) => setSubscribed((d.categories ?? []).includes(category)));
  }, [session, category]);

  async function toggle() {
    if (!session?.user) return router.push("/auth/login");
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ category }),
    });
    const d = await res.json();
    setSubscribed(Boolean(d.subscribed));
  }

  return (
    <button onClick={toggle} className="btn btn-outline">
      {subscribed ? "✓ Вы подписаны" : "Подписаться на новинки"}
    </button>
  );
}
