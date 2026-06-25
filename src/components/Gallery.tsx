"use client";

import { useEffect, useState } from "react";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setZoom(false);
      if (e.key === "ArrowRight") setActive((i) => (i + 1) % images.length);
      if (e.key === "ArrowLeft") setActive((i) => (i - 1 + images.length) % images.length);
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [zoom, images.length]);

  if (images.length === 0) {
    return (
      <div className="aspect-[16/10] bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
        нет фото
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setZoom(true)}
        className="block w-full aspect-[16/10] bg-slate-100 rounded-lg overflow-hidden cursor-zoom-in"
        aria-label="Увеличить фото"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[active]} alt={alt} className="w-full h-full object-cover" />
      </button>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 flex-wrap">
          {images.map((url, i) => (
            <button
              key={url + i}
              onClick={() => setActive(i)}
              className={`h-16 w-16 rounded-md overflow-hidden border ${
                i === active ? "border-white/60" : "border-white/10"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Лайтбокс */}
      {zoom && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/90 p-4"
          onClick={() => setZoom(false)}
        >
          <button
            onClick={() => setZoom(false)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 text-white text-xl hover:bg-white/20"
            aria-label="Закрыть"
          >
            ×
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i - 1 + images.length) % images.length);
                }}
                className="absolute left-4 h-12 w-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20"
                aria-label="Назад"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActive((i) => (i + 1) % images.length);
                }}
                className="absolute right-4 h-12 w-12 rounded-full bg-white/10 text-white text-2xl hover:bg-white/20"
                aria-label="Вперёд"
              >
                ›
              </button>
            </>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active]}
            alt={alt}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] object-contain rounded-lg"
          />
        </div>
      )}
    </div>
  );
}
