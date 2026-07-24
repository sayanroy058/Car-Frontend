import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, ZoomIn, ZoomOut } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

export function Lightbox({
  images,
  open,
  onOpenChange,
  index,
  onIndexChange,
  alt,
}: {
  images: string[];
  open: boolean;
  onOpenChange: (v: boolean) => void;
  index: number;
  onIndexChange: (i: number) => void;
  alt: string;
}) {
  const [zoomed, setZoomed] = useState(false);

  const go = useCallback(
    (dir: number) => {
      onIndexChange((index + dir + images.length) % images.length);
      setZoomed(false);
    },
    [index, images.length, onIndexChange],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
      else if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, go, onOpenChange]);

  useEffect(() => {
    if (!open) setZoomed(false);
  }, [open]);

  if (!images.length) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl border-0 bg-black/95 p-0 sm:rounded-2xl">
        <DialogTitle className="sr-only">{alt} — gallery</DialogTitle>
        <div className="relative flex h-[80vh] items-center justify-center overflow-hidden">
          <button
            onClick={() => onOpenChange(false)}
            aria-label="Close gallery"
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>

          <img
            src={images[index]}
            alt={`${alt} — image ${index + 1}`}
            className={`max-h-full max-w-full select-none object-contain transition-transform duration-200 ${
              zoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setZoomed((z) => !z)}
            draggable={false}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white backdrop-blur">
            <button
              onClick={() => setZoomed((z) => !z)}
              aria-label={zoomed ? "Zoom out" : "Zoom in"}
              className="grid h-6 w-6 place-items-center rounded-full hover:bg-white/20"
            >
              {zoomed ? <ZoomOut className="h-4 w-4" /> : <ZoomIn className="h-4 w-4" />}
            </button>
            <span>
              {index + 1} / {images.length}
            </span>
          </div>

          {images.length > 1 && (
            <div className="absolute inset-x-0 bottom-16 flex justify-center gap-1.5 px-4">
              {images.slice(0, 10).map((src, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onIndexChange(i);
                    setZoomed(false);
                  }}
                  className={`h-12 w-16 flex-none overflow-hidden rounded-md border-2 transition ${
                    i === index ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={src} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
