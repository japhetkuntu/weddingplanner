import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** clsx + tailwind-merge — later classes (e.g. a caller's className) win over base classes. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
