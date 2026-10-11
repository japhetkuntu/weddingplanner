import { Link } from "react-router-dom";
import { cn } from "@ovutor/ui";
import { PlaceholderImage } from "@/components/PlaceholderImage";
import { RichText } from "@/components/RichText";
import type { MarketingSectionDto } from "@/lib/marketingApi";
import type { FocalPoint } from "@/types";

const BACKGROUNDS: Record<string, string> = {
  gold: "bg-gold",
  "light-gold": "bg-gold/15",
  pink: "bg-primary",
  cream: "bg-bg",
  white: "bg-white",
};

const WIDTHS: Record<string, string> = {
  narrow: "max-w-xl",
  medium: "max-w-3xl",
  wide: "max-w-5xl",
  full: "max-w-none",
};

const RATIOS: Record<string, string> = {
  landscape: "aspect-[4/3]",
  portrait: "aspect-[3/4]",
  square: "aspect-square",
};

/** One admin-added section. Every look-and-feel choice (background, alignment, text width, columns,
 * image shape, button, extra photos) is the admin's; anything unset falls back to a sensible
 * default so sections saved before these options existed look unchanged. Text is always ink on
 * every background offered, so contrast is guaranteed whatever the page behind it. A section with
 * nothing in it renders nothing. */
export function DynamicContentBlock({ section }: { section: MarketingSectionDto }) {
  const { heading, body, image, layout, buttonLabel, buttonUrl } = section;
  const gallery = (section.gallery ?? []).filter((g) => g.url);
  if (!heading && !body && !image?.url && gallery.length === 0) return null;

  const bg = BACKGROUNDS[section.background ?? "light-gold"] ?? BACKGROUNDS["light-gold"];
  const width = WIDTHS[section.width ?? "medium"] ?? WIDTHS.medium;
  const ratio = RATIOS[section.imageRatio ?? "landscape"] ?? RATIOS.landscape;
  const sideLayout = layout === "image-left" || layout === "image-right";
  const hasSideImage = sideLayout && !!image?.url;
  const center = (section.align ?? (hasSideImage ? "left" : "center")) === "center";
  const columns = section.columns === 2 ? 2 : 1;

  const img = image?.url
    ? { src: image.url, label: image.label ?? "", focalPoint: ((image.focalPoint as FocalPoint) ?? "center") as FocalPoint }
    : null;

  const external = !!buttonUrl && /^https?:/i.test(buttonUrl);
  const button =
    buttonLabel && buttonUrl ? (
      <div className={cn("mt-8", center && "text-center")}>
        {external ? (
          <a href={buttonUrl} target="_blank" rel="noreferrer noopener" className="inline-block border border-ink bg-ink px-7 py-3 text-xs font-bold uppercase tracking-[.1em] text-bg hover:opacity-85">
            {buttonLabel}
          </a>
        ) : (
          <Link to={buttonUrl} className="inline-block border border-ink bg-ink px-7 py-3 text-xs font-bold uppercase tracking-[.1em] text-bg hover:opacity-85">
            {buttonLabel}
          </Link>
        )}
      </div>
    ) : null;

  const text = (
    <div className={cn("w-full", width, center && "mx-auto text-center")}>
      <span className={cn("mb-5 block h-[3px] w-12 bg-ink/70", center && "mx-auto")} />
      {heading ? <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl lg:text-5xl">{heading}</h2> : null}
      {body ? (
        <RichText
          html={body}
          size="lg"
          align={center ? "center" : undefined}
          className={cn("mt-6 text-ink/85", columns === 2 && "md:columns-2 md:gap-12 [&>*]:break-inside-avoid-column")}
        />
      ) : null}
      {button}
    </div>
  );

  const galleryRow = gallery.length ? (
    <div className={cn("mx-auto mt-10 grid w-full max-w-6xl gap-4 px-6 sm:px-10", gallery.length === 1 ? "grid-cols-1" : gallery.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3")}>
      {gallery.map((g, i) => (
        <div key={i} className="relative aspect-[4/3] overflow-hidden">
          <PlaceholderImage image={{ src: g.url!, label: g.label ?? "", focalPoint: ((g.focalPoint as FocalPoint) ?? "center") as FocalPoint }} className="absolute inset-0" />
        </div>
      ))}
    </div>
  ) : null;

  if (layout === "image-full" && img) {
    return (
      <section>
        <div className="relative aspect-[16/9] max-h-[80vh] w-full">
          <PlaceholderImage image={img} className="absolute inset-0" />
        </div>
        {heading || body ? <div className={cn("px-6 py-14 sm:px-12 sm:py-20", bg)}>{text}</div> : null}
        {galleryRow ? <div className={cn("pb-14", bg)}>{galleryRow}</div> : null}
      </section>
    );
  }

  if (hasSideImage && img) {
    return (
      <section className={bg}>
        <div className="grid grid-cols-1 lg:min-h-[70vh] lg:grid-cols-2">
          <div className={cn("relative w-full", ratio, "lg:aspect-auto", layout === "image-right" && "lg:order-2")}>
            <PlaceholderImage image={img} className="absolute inset-0" />
          </div>
          <div className={cn("flex items-center px-6 py-14 sm:px-12 sm:py-20 lg:px-16", layout === "image-right" && "lg:order-1")}>{text}</div>
        </div>
        {galleryRow ? <div className="pb-14">{galleryRow}</div> : null}
      </section>
    );
  }

  return (
    <section className={bg}>
      <div className="px-6 py-16 sm:px-12 sm:py-20">{text}</div>
      {galleryRow ? <div className="pb-16">{galleryRow}</div> : null}
    </section>
  );
}
