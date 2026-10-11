const DROP = new Set(["SCRIPT", "STYLE", "IFRAME", "OBJECT", "EMBED", "NOSCRIPT", "TEMPLATE", "TEXTAREA", "SELECT"]);
const ALLOWED = new Set(["P", "BR", "STRONG", "B", "EM", "I", "U", "H2", "H3", "H4", "UL", "OL", "LI", "BLOCKQUOTE", "A", "SPAN", "DIV", "HR"]);

function cleanStyle(style: string): string {
  const m = style.match(/text-align\s*:\s*(left|center|right|justify)/i);
  return m ? `text-align:${m[1].toLowerCase()}` : "";
}

function walk(node: Node, doc: Document): Node | null {
  if (node.nodeType === Node.TEXT_NODE) return doc.createTextNode(node.textContent ?? "");
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  const el = node as HTMLElement;
  if (DROP.has(el.tagName)) return null;
  const frag = doc.createDocumentFragment();
  const children = () => {
    el.childNodes.forEach((c) => {
      const r = walk(c, doc);
      if (r) frag.appendChild(r);
    });
    return frag;
  };
  if (!ALLOWED.has(el.tagName)) return children();
  const out = doc.createElement(el.tagName === "B" ? "strong" : el.tagName === "I" ? "em" : el.tagName === "DIV" ? "p" : el.tagName.toLowerCase());
  const style = cleanStyle(el.getAttribute("style") ?? "");
  if (style) out.setAttribute("style", style);
  if (el.tagName === "A") {
    const href = el.getAttribute("href") ?? "";
    if (/^(https?:|mailto:|tel:|\/)/i.test(href)) {
      out.setAttribute("href", href);
      if (/^https?:/i.test(href)) {
        out.setAttribute("target", "_blank");
        out.setAttribute("rel", "noreferrer noopener");
      }
    }
  }
  out.appendChild(children());
  return out;
}

/** Allow-list sanitiser for admin-authored rich text: keeps basic formatting, lists, headings,
 * links and text alignment; drops everything else (scripts, handlers, unknown styles). */
export function sanitizeHtml(html: string): string {
  if (typeof DOMParser === "undefined") return "";
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
  const out = document.createElement("div");
  doc.body.childNodes.forEach((n) => {
    const r = walk(n, document);
    if (r) out.appendChild(r);
  });
  return out.innerHTML;
}

const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Plain text (older content) → paragraphs: blank lines split paragraphs, "Name:" interview turns
 * get their own paragraph with the name set apart, and long runs are paced into short chunks. */
export function plainToHtml(raw: string): string {
  const withBreaks = raw.replace(/\r/g, "").replace(/([.!?”"’])\s+([A-Z][a-z]{1,15}):\s/g, "$1\n\n$2: ");
  const out: string[] = [];
  for (const chunk of withBreaks.split(/\n{2,}/)) {
    const t = chunk.trim();
    if (!t) continue;
    const m = t.match(/^([A-Z][a-z]{1,15}):\s+([\s\S]*)$/);
    const speaker = m?.[1];
    const body = m ? m[2] : t;
    const sentences = body.match(/[^.!?]+[.!?]+["”’)]*\s*|[^.!?]+$/g) ?? [body];
    let cur = "";
    let first = true;
    const flush = () => {
      if (!cur.trim()) return;
      const label = first && speaker ? `<span class="rt-speaker">${escapeHtml(speaker)}</span> ` : "";
      out.push(`<p>${label}${escapeHtml(cur.trim()).replace(/\n/g, "<br>")}</p>`);
      first = false;
      cur = "";
    };
    for (const s of sentences) {
      if (cur.length > 0 && cur.length + s.length > 520) flush();
      cur += s;
    }
    flush();
  }
  return out.join("");
}

const HAS_TAGS = /<\/?(p|h[1-6]|ul|ol|li|strong|em|u|br|blockquote|a|span|div)\b/i;

/** Rich-text HTML or legacy plain text → safe HTML ready to render. */
export function toSafeHtml(value: string | null | undefined): string {
  if (!value || !value.trim()) return "";
  return HAS_TAGS.test(value) ? sanitizeHtml(value) : plainToHtml(value);
}
