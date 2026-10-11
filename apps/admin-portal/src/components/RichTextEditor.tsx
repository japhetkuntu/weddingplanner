import { useEffect, useRef } from "react";

const BTN = "min-w-[30px] border border-[#ccc] bg-white px-2 py-1 text-xs font-bold text-ink/80 hover:border-ink";

/** A small rich-text editor (no dependencies): bold, italic, underline, headings, bullet and
 * numbered lists, quote, link, text alignment and clear-formatting. Stores clean HTML. */
export function RichTextEditor({
  value,
  onChange,
  minHeight = 140,
  placeholder,
}: {
  value: string;
  onChange: (html: string) => void;
  minHeight?: number;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef<string | null>(null);

  useEffect(() => {
    const el = ref.current;
    // Only sync from outside when the value didn't come from this editor's own typing (so the caret never jumps).
    if (el && value !== lastEmitted.current) {
      el.innerHTML = value || "";
      lastEmitted.current = value;
    }
  }, [value]);

  function exec(cmd: string, arg?: string) {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  }

  function emit() {
    const el = ref.current;
    if (!el) return;
    const html = el.innerHTML === "<br>" ? "" : el.innerHTML;
    lastEmitted.current = html;
    onChange(html);
  }

  const tool = (label: string, cmd: string, arg?: string, title?: string) => (
    <button key={label} type="button" title={title ?? label} className={BTN} onMouseDown={(e) => e.preventDefault()} onClick={() => exec(cmd, arg)}>
      {label}
    </button>
  );

  return (
    <div className="border border-[#ccc] bg-white">
      <div className="flex flex-wrap gap-1 border-b border-[#ddd] bg-bg-warm p-1.5">
        {tool("B", "bold", undefined, "Bold")}
        {tool("I", "italic", undefined, "Italic")}
        {tool("U", "underline", undefined, "Underline")}
        {tool("H2", "formatBlock", "<h2>", "Large heading")}
        {tool("H3", "formatBlock", "<h3>", "Sub-heading")}
        {tool("¶", "formatBlock", "<p>", "Normal paragraph")}
        {tool("• List", "insertUnorderedList", undefined, "Bullet list")}
        {tool("1. List", "insertOrderedList", undefined, "Numbered list")}
        {tool("❝", "formatBlock", "<blockquote>", "Quote")}
        {tool("Left", "justifyLeft")}
        {tool("Centre", "justifyCenter")}
        {tool("Right", "justifyRight")}
        <button
          type="button"
          className={BTN}
          title="Link"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            const url = window.prompt("Link address (https://…)");
            if (url) exec("createLink", url);
          }}
        >
          Link
        </button>
        {tool("Clear", "removeFormat", undefined, "Remove formatting")}
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={emit}
        onBlur={emit}
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData("text/plain");
          document.execCommand("insertText", false, text);
        }}
        className="rt-editor px-3 py-2.5 text-sm leading-relaxed text-ink outline-none"
        style={{ minHeight }}
      />
    </div>
  );
}
