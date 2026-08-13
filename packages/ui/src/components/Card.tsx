import type { HTMLAttributes } from "react";
import { cn } from "../cn";

export type CardTone = "paper" | "cream";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  tone?: CardTone;
}

const toneClasses: Record<CardTone, string> = {
  paper: "bg-white border border-[#ddd]",
  cream: "bg-bg-warm border border-[#ddd]",
};

export function Card({ tone = "paper", className, ...props }: CardProps) {
  return <div className={cn(toneClasses[tone], "p-4", className)} {...props} />;
}
