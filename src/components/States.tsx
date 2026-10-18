import { ApiError } from '../api/client'

export function Loading({ text = 'טוען...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-10 text-muted">
      <span className="size-5 animate-spin rounded-full border-2 border-water-bright border-t-transparent" />
      {text}
    </div>
  )
}

export function ErrorState({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const message = error instanceof ApiError ? error.message : 'אירעה שגיאה בטעינת הנתונים'
  const traceId = error instanceof ApiError ? error.traceId : undefined
  return (
    <div className="flex flex-col items-center gap-3 p-10 text-center">
      <div className="font-bold text-danger">{message}</div>
      {traceId && <div className="text-xs text-muted">מספר מעקב: {traceId}</div>}
      {onRetry && (
        <button className="btn-ghost btn-sm" onClick={onRetry}>
          נסי שוב
        </button>
      )}
    </div>
  )
}

export function Empty({ text }: { text: string }) {
  return <div className="p-10 text-center text-muted">{text}</div>
}
