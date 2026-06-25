"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Review = {
  rating: number;
  comment: string;
  reply: string | null;
} | null;

export function ReviewBlock({
  dealId,
  review,
  role, // "buyer" | "seller"
  canReview,
}: {
  dealId: string;
  review: Review;
  role: "buyer" | "seller";
  canReview: boolean;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(review?.rating ?? 5);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [reply, setReply] = useState(review?.reply ?? "");
  const [busy, setBusy] = useState(false);

  async function submitReview(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/deals/${dealId}/review`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rating, comment }),
    });
    setBusy(false);
    router.refresh();
  }

  async function submitReply(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    await fetch(`/api/deals/${dealId}/review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reply }),
    });
    setBusy(false);
    router.refresh();
  }

  const input = "w-full rounded-md border border-slate-300 px-3 py-2";

  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <div className="text-sm font-medium text-slate-700">Отзыв</div>

      {/* Покупатель оставляет/редактирует отзыв */}
      {role === "buyer" && canReview && (
        <form onSubmit={submitReview} className="mt-3 space-y-3">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                className={`text-2xl ${n <= rating ? "text-amber-500" : "text-slate-300"}`}
              >
                ★
              </button>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Ваш отзыв о сделке"
            rows={3}
            className={input}
          />
          <button
            disabled={busy}
            className="rounded-md bg-slate-900 text-white px-4 py-2 text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {review ? "Обновить отзыв" : "Оставить отзыв"}
          </button>
        </form>
      )}

      {/* Показ существующего отзыва */}
      {review && (
        <div className="mt-3 rounded-md bg-slate-50 p-3">
          <div className="text-amber-500">{"★".repeat(review.rating)}</div>
          <p className="mt-1 text-sm text-slate-700">{review.comment}</p>
          {review.reply && (
            <div className="mt-2 border-l-2 border-slate-300 pl-2 text-sm text-slate-600">
              <span className="font-medium">Ответ поставщика:</span> {review.reply}
            </div>
          )}
        </div>
      )}

      {/* Поставщик отвечает на отзыв */}
      {role === "seller" && review && !review.reply && (
        <form onSubmit={submitReply} className="mt-3 space-y-2">
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Ответить на отзыв"
            rows={2}
            className={input}
          />
          <button
            disabled={busy}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Ответить
          </button>
        </form>
      )}

      {!review && role === "seller" && (
        <p className="mt-2 text-sm text-slate-400">Покупатель ещё не оставил отзыв.</p>
      )}
    </div>
  );
}
