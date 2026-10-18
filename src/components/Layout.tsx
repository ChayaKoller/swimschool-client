import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { roleLabels } from '../lib/format'
import logo from '../assets/logo.png'
import Waves from './Waves'

const links = [
  { to: '/groups', label: 'קבוצות', icon: <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm8 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM3 19c0-3 3-5 6-5s6 2 6 5m0 0c0-2 1.5-3.5 4-3.5" /> },
  { to: '/students', label: 'תלמידות', icon: <path d="M12 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM5 20c0-3.5 3-6 7-6s7 2.5 7 6" /> },
  { to: '/reports', label: 'דוחות לקופות', icon: <path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" /> },
]

export default function Layout() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 bg-brand text-white">
        <div className="mx-auto flex max-w-[1280px] items-center gap-4 px-4 py-2.5">
          <div className="rounded-[10px] bg-white px-2.5 py-1">
            <img src={logo} alt="האקווריום, המרכז הבטוח ללימודי שחיה" className="block h-9" />
          </div>
          <div className="flex-1" />
          {user && (
            <div className="flex items-center gap-3 text-sm">
              <div className="hidden text-left sm:block">
                <div>{user.fullName}</div>
                <div className="text-xs opacity-80">{roleLabels[user.role]}</div>
              </div>
              <div className="grid size-9 place-items-center rounded-full bg-water-bright font-bold" aria-hidden="true">
                {user.fullName.charAt(0)}
              </div>
              <button className="btn-ghost btn-sm" onClick={logout}>
                יציאה
              </button>
            </div>
          )}
        </div>
        <Waves className="bg-brand" />
      </header>

      <div className="mx-auto grid max-w-[1280px] gap-6 px-4 py-6 md:grid-cols-[210px_1fr]">
        <nav className="flex gap-1 overflow-x-auto md:flex-col" aria-label="תפריט ראשי">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-[10px] px-3 py-2.5 font-medium whitespace-nowrap ${
                  isActive ? 'bg-water-tint font-bold text-water' : 'text-brand-soft hover:bg-[#f1e9e4]'
                }`
              }
            >
              <svg viewBox="0 0 24 24" className="size-5 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {link.icon}
              </svg>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <main className="flex min-w-0 flex-col gap-5">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
