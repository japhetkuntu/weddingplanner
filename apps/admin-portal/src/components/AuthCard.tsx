import type { ReactNode } from "react";
import { Logo } from "@ovutor/ui";

export function AuthShell({ children }: { children: ReactNode }) {
  return <div className="grid min-h-screen place-items-center bg-bg px-4 py-10">{children}</div>;
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <section className="w-full max-w-[440px] border border-[#ddd] bg-white p-8 sm:p-10">{children}</section>;
}

export function AuthLogo() {
  return <Logo className="h-8" />;
}

export function AuthEyebrow({ children }: { children: ReactNode }) {
  return <p className="mt-4 text-[10px] font-bold uppercase tracking-[.14em] text-primary">{children}</p>;
}
