import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from 'react'

type Kind = 'success' | 'error'
interface ToastItem {
  id: number
  kind: Kind
  title: string
  message?: string
  traceId?: string
}

interface ToastApi {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string, traceId?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const nextId = useRef(1)

  const remove = useCallback((id: number) => setItems((list) => list.filter((t) => t.id !== id)), [])

  const push = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = nextId.current++
      setItems((list) => [...list.slice(-2), { ...item, id }])
      setTimeout(() => remove(id), item.kind === 'error' ? 8000 : 4500)
    },
    [remove],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (title, message) => push({ kind: 'success', title, message }),
      error: (title, message, traceId) => push({ kind: 'error', title, message, traceId }),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="fixed bottom-5 left-5 z-50 flex w-[min(420px,calc(100vw-40px))] flex-col gap-2" role="status" aria-live="polite">
        {items.map((t) => (
          <div
            key={t.id}
            className={`flex items-start gap-3 rounded-xl border p-4 shadow-[0_8px_24px_rgba(74,42,30,0.18)] ${
              t.kind === 'success' ? 'border-[#cfe3bf] bg-leaf-tint text-[#2f5419]' : 'border-[#f5c6c0] bg-danger-tint text-[#8e1c1c]'
            }`}
          >
            <div className="min-w-0 flex-1">
              <div className="font-bold">{t.title}</div>
              {t.message && <div className="text-sm">{t.message}</div>}
              {t.traceId && <div className="mt-1 text-xs opacity-75">מספר מעקב: {t.traceId}</div>}
            </div>
            <button className="px-1 text-lg leading-none" aria-label="סגירה" onClick={() => remove(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastApi {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used inside ToastProvider')
  return context
}
