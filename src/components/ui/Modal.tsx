import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import Button from "./Button";

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={title}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-card border-[1.5px] border-line bg-white p-0 text-ink shadow-lifted"
    >
      <div className="flex items-center justify-between gap-3 border-b-[1.5px] border-line px-5 py-3">
        <h2 className="text-lg font-bold">{title}</h2>
        <Button variant="ghost" onClick={onClose} aria-label="סגירה" className="size-9 px-0" icon={<X />} />
      </div>

      <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>

      {footer && (
        <div className="flex flex-wrap justify-end gap-2 border-t-[1.5px] border-line px-5 py-3">{footer}</div>
      )}
    </dialog>
  );
}