import { cn } from "../cn";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export function Toggle({ checked, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-6 w-11 shrink-0 border transition-colors", checked ? "border-primary bg-primary" : "border-ink/30 bg-white")}
    >
      <span
        className={cn(
          "absolute top-1/2 h-4 w-4 -translate-y-1/2 bg-white transition-all",
          checked ? "right-0.5 bg-white" : "left-0.5 bg-ink/40",
        )}
      />
    </button>
  );
}
