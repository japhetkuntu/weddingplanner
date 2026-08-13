import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ErrorModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

/** Blocking error surface — use when a failure needs the user to stop and make a correction
 * before continuing (a validation failure, a failed save that lost their input, etc). For
 * failures the user can just shrug off and retry, use Toast with tone="error" instead. */
export function ErrorModal({ open, onClose, title = "Something needs your attention", message }: ErrorModalProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className="mb-5 flex items-start gap-3">
        <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-primary/40 bg-[#fff2f0] text-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
            <path d="M12 7.5v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="12" cy="16.5" r="1" fill="currentColor" />
          </svg>
        </div>
        <div className="min-w-0 pt-1">
          <h3 className="font-display text-xl leading-tight">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-ink/70">{message}</p>
        </div>
      </div>
      <Button className="w-full" onClick={onClose}>
        Close
      </Button>
    </Modal>
  );
}
