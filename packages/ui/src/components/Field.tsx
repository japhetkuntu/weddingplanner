import { forwardRef } from "react";
import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes, LabelHTMLAttributes, ReactNode } from "react";
import { cn } from "../cn";

const fieldBase =
  "w-full border border-[#8e8985] bg-white px-3 py-[11px] font-sans text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-ink";

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 mt-4 block text-[11px] font-bold uppercase tracking-[.05em] text-ink first:mt-0", className)}
      {...props}
    />
  );
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => <input ref={ref} className={cn(fieldBase, "h-[46px]", className)} {...props} />,
);
Input.displayName = "Input";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => <textarea ref={ref} className={cn(fieldBase, "min-h-[96px] resize-y", className)} {...props} />,
);
Textarea.displayName = "Textarea";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  ({ className, children, ...props }, ref) => (
    <select ref={ref} className={cn(fieldBase, "h-[46px]", className)} {...props}>
      {children}
    </select>
  ),
);
Select.displayName = "Select";

export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
}

export function Checkbox({ label, className, id, ...props }: CheckboxProps) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-[12px] font-medium text-ink">
      <input id={id} type="checkbox" className={cn("h-4 w-4 border border-[#8e8985]", className)} {...props} />
      {label}
    </label>
  );
}
