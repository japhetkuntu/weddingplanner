import type { ReactNode } from "react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative w-full max-w-[440px] bg-white p-6 shadow-modal">
        {title ? <h3 className="mb-3 font-display text-2xl">{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
