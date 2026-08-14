import { useState } from "react";
import { cn } from "../cn";

export interface CopyButtonProps {
  value: string;
  label?: string;
  className?: string;
}

/** Copies `value` to the clipboard on click and flips to a "Copied" confirmation for a beat —
 * so sharing a generated password/link never means select-all-and-hope-you-got-it-all. */
export function CopyButton({ value, label = "Copy", className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — the value is still visible to select manually.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn(
        "inline-flex shrink-0 items-center gap-1 text-[10px] font-bold uppercase tracking-[.08em] transition-colors",
        copied ? "text-[#2f6d43]" : "text-primary hover:text-ink",
        className,
      )}
    >
      {copied ? (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12.5l5 5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied
        </>
      ) : (
        <>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <rect x="8" y="8" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
            <path d="M16 8V5.5A1.5 1.5 0 0 0 14.5 4H5.5A1.5 1.5 0 0 0 4 5.5v9A1.5 1.5 0 0 0 5.5 16H8" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          {label}
        </>
      )}
    </button>
  );
}
