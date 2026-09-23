import { useCallback, useEffect, useState } from "react";

/** Filling a frame with `object-cover` is the nicest look, but when the photo's shape is very
 * different from the frame's, cover throws away a big chunk of the picture (a tall portrait in a
 * wide banner loses most of it). This measures both shapes and only falls back to showing the
 * whole photo (over a blurred copy of itself) when cover would crop more than about a third of it. */
const MAX_CROP_RATIO = 1.5;

export function useSmartFit(forced?: "cover" | "contain") {
  const [el, setEl] = useState<HTMLDivElement | null>(null);
  const frameRef = useCallback((node: HTMLDivElement | null) => setEl(node), []);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frame, setFrame] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientHeight });
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [el]);

  const onLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement | HTMLVideoElement>) => {
    const t = e.currentTarget;
    const w = t instanceof HTMLImageElement ? t.naturalWidth : t.videoWidth;
    const h = t instanceof HTMLImageElement ? t.naturalHeight : t.videoHeight;
    if (w && h) setNatural({ w, h });
  }, []);

  let fit: "cover" | "contain" = forced ?? "cover";
  if (!forced && natural && frame && frame.w && frame.h) {
    const a = natural.w / natural.h;
    const b = frame.w / frame.h;
    fit = Math.max(a / b, b / a) > MAX_CROP_RATIO ? "contain" : "cover";
  }
  return { frameRef, onLoad, fit };
}
