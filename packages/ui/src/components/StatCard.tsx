import type { ReactNode } from "react";
import { cn } from "../cn";
import { Card } from "./Card";

export interface StatCardProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  valueClassName?: string;
  className?: string;
}

export function StatCard({ label, value, hint, valueClassName, className }: StatCardProps) {
  return (
    <Card className={cn("min-w-0", className)}>
      <div className="text-[13px] text-ink/70">{label}</div>
      <div className={cn("my-1.5 font-display text-[27px] leading-none text-ink", valueClassName)}>{value}</div>
      {hint ? <div className="text-xs text-ink/50">{hint}</div> : null}
    </Card>
  );
}
