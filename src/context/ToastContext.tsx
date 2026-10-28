import { useState, useCallback, useMemo, type ReactNode } from "react";
import clsx from "clsx";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { ToastContext, type ToastApi, type ToastMessage } from "./useToast";


const kindClasses = {
  success: "border-success/50 text-success",
  error: "border-danger/50 text-danger",
  info: "border-primary/50 text-primary-text",
} satisfies Record<ToastMessage["kind"], string>;

const kindIcons = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
} satisfies Record<ToastMessage["kind"], unknown>;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

 
  const removeToast = useCallback((id: string) => {
    setMessages((prev) => prev.filter((message) => message.id !== id));
  }, []);


  const addToast = useCallback(
    (kind: ToastMessage["kind"], message: string) => {
      const id = crypto.randomUUID();
      setMessages((prev) => [...prev, { message, id, kind }]);
      setTimeout(() => removeToast(id), 4000);
    },
    [removeToast],
  );

  const value = useMemo<ToastApi>(
    () => ({
      success: (text) => addToast("success", text),
      error: (text) => addToast("error", text),
      info: (text) => addToast("info", text),
    }),
    [addToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}

      <div
        role="status"
        aria-live="polite"
        className="pointer-events-none fixed inset-x-4 bottom-4 z-50 flex flex-col items-center gap-2 sm:inset-x-auto sm:start-6 sm:bottom-6 sm:items-start"
      >
        {messages.map((message) => {
          const Icon = kindIcons[message.kind];
          return (
            <div
              key={message.id}
              className={clsx(
                "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-control border-[1.5px] bg-white px-4 py-3 shadow-hard",
                kindClasses[message.kind],
              )}
            >
              <Icon aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
              <span className="flex-1 text-sm font-medium text-line">{message.message}</span>
              <button
                type="button"
                aria-label="סגירת הודעה"
                onClick={() => removeToast(message.id)}
                className="-me-1 grid size-6 shrink-0 cursor-pointer place-items-center rounded-full text-slate-500 hover:bg-ink/10 hover:text-line"
              >
                <X aria-hidden="true" className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}