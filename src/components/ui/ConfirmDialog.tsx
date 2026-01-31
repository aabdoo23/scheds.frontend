import { useEffect, useRef } from 'react';
import { Button } from '@/components/ui/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const previousActiveRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      previousActiveRef.current = document.activeElement as HTMLElement | null;
      dialog.showModal();
    } else {
      dialog.close();
      previousActiveRef.current?.focus();
      previousActiveRef.current = null;
    }
  }, [open]);

  const handleClose = () => {
    onCancel();
  };

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onCancel();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      className="z-[9999] fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-auto max-w-[min(90vw,28rem)] p-0 rounded-xl border border-white/10 shadow-xl bg-[var(--lighter-dark)] text-[var(--light-text)] backdrop:bg-black/50"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
    >
      <div className="p-6">
        <h2 id="confirm-dialog-title" className="text-xl font-semibold m-0 mb-2">
          {title}
        </h2>
        <p id="confirm-dialog-desc" className="text-[var(--dark-text)] m-0 mb-6">
          {message}
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={handleClose}>
            {cancelLabel}
          </Button>
          <Button variant="danger" onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </dialog>
  );
}
