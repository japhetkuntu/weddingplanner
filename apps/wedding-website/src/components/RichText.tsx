import { cn } from "@ovutor/ui";
import { toSafeHtml } from "@/lib/richText";

/** Renders admin-authored rich text (or legacy plain text) with the site's typography. `tone`
 * picks text colours for light vs. dark backgrounds; `size` scales the type. */
export function RichText({
  html,
  className,
  size = "md",
  align,
}: {
  html: string | null | undefined;
  className?: string;
  size?: "md" | "lg";
  align?: "left" | "center";
}) {
  const safe = toSafeHtml(html);
  if (!safe) return null;
  return (
    <div
      className={cn("rich-text", size === "lg" && "rich-text-lg", align === "center" && "text-center", className)}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
