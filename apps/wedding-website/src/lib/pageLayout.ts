import type { MarketingPageDto, MarketingSectionDto } from "@/lib/marketingApi";

export interface LayoutItem {
  id: string;
  /** Present when this item is an admin-added extra section. */
  section?: MarketingSectionDto;
}

/** Resolves the order a page's blocks render in. `defaults` lists the page's built-in block ids in
 * their built-in order, with the literal "sections" standing for "all admin-added extra sections, in
 * their own order". The admin's saved `layout.order` (built-in ids and "section:<id>") wins; any block
 * missing from it (a newly added section, say) goes to the end, and unknown ids are ignored — so an old or partial layout can never hide anything. The page's hero
 * is not part of this list: it is always first. */
export function orderPage(page: MarketingPageDto | null, sections: MarketingSectionDto[], defaults: string[]): LayoutItem[] {
  const byId = new Map<string, MarketingSectionDto>();
  sections.forEach((s) => byId.set(`section:${s.id}`, s));

  const defaultIds: string[] = [];
  defaults.forEach((d) => {
    if (d === "sections") sections.forEach((s) => defaultIds.push(`section:${s.id}`));
    else defaultIds.push(d);
  });

  const saved = ((page?.content["layout"] as { order?: string[] } | undefined)?.order ?? []).filter((id) => defaultIds.includes(id));
  const result: string[] = [];
  saved.forEach((id) => {
    if (!result.includes(id)) result.push(id);
  });

  // Anything not in the saved order (a section added after the layout was saved) goes to the end.
  defaultIds.forEach((id) => {
    if (!result.includes(id)) result.push(id);
  });

  return result.map((id) => ({ id, section: byId.get(id) }));
}
