import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { ApiError } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import logo from '../assets/logo.png'
import Waves from '../components/Waves'

export default function LoginPage() {
  const { user, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/groups'
  if (user) return <Navigate to={from} replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await login(email.trim(), password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'ההתחברות נכשלה')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-10">
      <div className="card w-full max-w-[400px] overflow-hidden">
        <div className="flex flex-col items-center gap-3 px-7 pt-8 pb-4 text-center">
          <img src={logo} alt="האקווריום, המרכז הבטוח ללימודי שחיה" className="h-[70px]" />
          <div>
            <h1 className="text-[22px] font-extrabold text-brand">כניסה למערכת</h1>
            <p className="mt-1 text-muted">ניהול קבוצות, תלמידות ודוחות לקופות</p>
          </div>
        </div>
        <Waves />
        <form className="flex flex-col gap-4 px-7 pt-4 pb-8" onSubmit={submit} noValidate>
          <div>
            <label className="field-label" htmlFor="email">
              אימייל
            </label>
            <input id="email" type="email" dir="ltr" className="input text-right" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required autoFocus />
          </div>
          <div>
            <label className="field-label" htmlFor="password">
              סיסמה
            </label>
            <input id="password" type="password" dir="ltr" className="input text-right" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {error && <div className="rounded-[10px] bg-danger-tint px-3 py-2 text-sm text-[#8e1c1c]">{error}</div>}
          <button className="btn-primary" type="submit" disabled={busy || !email || !password}>
            {busy ? 'מתחבר...' : 'כניסה'}
          </button>
        </form>
      </div>
    </div>
  )
}
