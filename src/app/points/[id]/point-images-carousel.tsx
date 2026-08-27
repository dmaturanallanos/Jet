"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Images } from "lucide-react";

export type PointCarouselImage = {
  id: string;
  url: string;
  isPrimary: boolean;
  createdAt: string;
};

export function PointImagesCarousel({ images }: { images: PointCarouselImage[] }) {
  const [index, setIndex] = useState(0);
  const current = images[index];
  const date = useMemo(() => new Date(current.createdAt).toLocaleDateString("es-CL"), [current.createdAt]);

  function previous() {
    setIndex((value) => (value === 0 ? images.length - 1 : value - 1));
  }

  function next() {
    setIndex((value) => (value === images.length - 1 ? 0 : value + 1));
  }

  return (
    <div className="overflow-hidden rounded-lg border border-black/10 bg-white dark:border-white/10 dark:bg-white/[0.04]">
      <a href={current.url} target="_blank" rel="noreferrer" className="block">
        <div className="aspect-[4/3] bg-slate-200 bg-cover bg-center dark:bg-zinc-800" style={{ backgroundImage: `url(${current.url})` }} />
      </a>
      <div className="flex items-center justify-between gap-3 p-3">
        <div className="min-w-0 text-sm">
          <p className="flex items-center gap-2 font-semibold">
            <Images className="size-4 text-cyan-600 dark:text-cyan-300" />
            {index + 1} de {images.length}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {date}{current.isPrimary ? " - Principal" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={previous} className="grid size-9 place-items-center rounded-lg border border-black/10 dark:border-white/10" aria-label="Imagen anterior">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" onClick={next} className="grid size-9 place-items-center rounded-lg border border-black/10 dark:border-white/10" aria-label="Imagen siguiente">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-2 overflow-x-auto px-3 pb-3">
        {images.map((image, imageIndex) => (
          <button
            key={image.id}
            type="button"
            onClick={() => setIndex(imageIndex)}
            className="h-14 w-16 shrink-0 rounded-md border border-black/10 bg-cover bg-center data-[active=true]:border-cyan-400 dark:border-white/10"
            data-active={imageIndex === index}
            style={{ backgroundImage: `url(${image.url})` }}
            aria-label={`Ver imagen ${imageIndex + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
