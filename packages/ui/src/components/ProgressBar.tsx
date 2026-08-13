import { cn } from "../cn";

export interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  trackClassName?: string;
  fillClassName?: string;
}

export function ProgressBar({ value, className, trackClassName, fillClassName }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className={cn("h-2 w-full bg-[#e7e4e0]", trackClassName, className)}>
      <div className={cn("h-full bg-primary transition-all duration-300", fillClassName)} style={{ width: `${pct}%` }} />
    </div>
  );
}
