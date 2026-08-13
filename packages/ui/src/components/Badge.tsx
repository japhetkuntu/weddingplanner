import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type BadgeTone = "primary" | "ink" | "muted" | "success" | "warning";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

const toneClasses: Record<BadgeTone, string> = {
  primary: "text-primary border-primary/40",
  ink: "text-ink border-ink/30",
  muted: "text-ink/50 border-ink/20",
  success: "text-[#2f6d43] border-[#2f6d43]/40",
  warning: "text-[#a15a12] border-[#a15a12]/40",
};

export function Badge({ tone = "primary", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block border px-2 py-1 text-[10px] font-bold uppercase tracking-[.08em]",
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
