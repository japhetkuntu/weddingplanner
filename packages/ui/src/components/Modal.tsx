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
      <div className="relative flex max-h-[85vh] w-full max-w-[440px] flex-col bg-white p-6 shadow-modal">
        {title ? <h3 className="mb-3 shrink-0 font-display text-2xl">{title}</h3> : null}
        <div className="overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
