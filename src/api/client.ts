import type { ErrorResponse } from './types'

// Empty in development (the Vite proxy forwards /api). The full server address in production.
const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')

const TOKEN_KEY = 'swimschool.token'

export const tokenStore = {
  get: (): string | null => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
}

// Called when the server says the session is over (401), so the app can return to login
let onUnauthorized: () => void = () => {}
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler
}

export class ApiError extends Error {
  readonly status: number
  readonly code: string
  readonly fieldErrors: Record<string, string[]>
  readonly traceId?: string

  constructor(status: number, body: Partial<ErrorResponse> | null) {
    super(body?.message || defaultMessage(status))
    this.status = status
    this.code = body?.code ?? 'UNKNOWN'
    this.fieldErrors = body?.errors ?? {}
    this.traceId = body?.traceId
  }

  // Field errors arrive with server names ("FullName", "LessonDates[2]"); look up case-insensitively
  fieldError(field: string): string | undefined {
    const key = Object.keys(this.fieldErrors).find((k) => k.toLowerCase() === field.toLowerCase())
    return key ? this.fieldErrors[key][0] : undefined
  }
}

function defaultMessage(status: number): string {
  if (status === 0) return 'אין חיבור לשרת. נא לבדוק שהשרת פועל ולנסות שוב'
  if (status >= 500) return 'אירעה שגיאה בשרת. נסי שוב מאוחר יותר'
  return 'הפעולה נכשלה'
}

type Query = Record<string, string | number | boolean | null | undefined>

function buildUrl(path: string, query?: Query): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') params.append(key, String(value))
  }
  const qs = params.toString()
  return `${API_URL}${path}${qs ? `?${qs}` : ''}`
}

async function send(method: string, path: string, options: { query?: Query; body?: unknown } = {}): Promise<Response> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = tokenStore.get()
  if (token) headers.Authorization = `Bearer ${token}`
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(buildUrl(path, options.query), {
      method,
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError(0, null)
  }

  if (!response.ok) {
    let body: Partial<ErrorResponse> | null = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    // A failed login is also 401, but it is not an expired session
    if (response.status === 401 && path !== '/api/auth/login') onUnauthorized()
    throw new ApiError(response.status, body)
  }
  return response
}

async function json<T>(method: string, path: string, options: { query?: Query; body?: unknown } = {}): Promise<T> {
  const response = await send(method, path, options)
  if (response.status === 204) return undefined as T
  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string, query?: Query) => json<T>('GET', path, { query }),
  post: <T>(path: string, body?: unknown) => json<T>('POST', path, { body }),
  put: <T>(path: string, body?: unknown) => json<T>('PUT', path, { body }),
  delete: <T>(path: string, query?: Query) => json<T>('DELETE', path, { query }),

  async file(path: string): Promise<{ blob: Blob; fileName: string }> {
    const response = await send('GET', path)
    const blob = await response.blob()
    return { blob, fileName: fileNameFrom(response.headers.get('Content-Disposition')) }
  },
}

// Supports filename*=UTF-8''... (Hebrew names) and plain filename="..."
function fileNameFrom(header: string | null): string {
  if (!header) return 'report.pdf'
  const utf8 = /filename\*=UTF-8''([^;]+)/i.exec(header)
  if (utf8) return decodeURIComponent(utf8[1])
  const plain = /filename="?([^";]+)"?/i.exec(header)
  return plain ? plain[1] : 'report.pdf'
}
