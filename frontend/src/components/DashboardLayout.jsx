import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'

const icons = {
  overview:
    'M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
  services:
    'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
  calendar: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  appointments:
    'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  logout: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
  menu: 'M4 6h16M4 12h16M4 18h16',
  plus: 'M12 4v16m8-8H4',
}

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: icons.overview, end: true },
  { to: '/dashboard/services', label: 'Services', icon: icons.services },
  { to: '/dashboard/book', label: 'Book Appointment', icon: icons.calendar },
  { to: '/dashboard/appointments', label: 'My Appointments', icon: icons.appointments },
]

// Dummy user, baad mein asli data backend se aayega
const user = { name: 'Ayesha Khan', role: 'Patient', initials: 'AK' }

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

function DashboardLayout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-linear-to-b from-brand-900 to-slate-950 px-4 py-6">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-brand-500 to-fuchsia-500 shadow-lg shadow-brand-500/30">
          <Icon path={icons.calendar} className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold text-white">Smart Appointment</span>
      </div>

      <p className="relative mb-2 px-3 text-[11px] font-semibold uppercase tracking-widest text-indigo-300/50">
        Menu
      </p>

      <nav className="relative flex-1 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl p-2 pr-3 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-linear-to-r from-brand-500 to-violet-500 text-white shadow-lg shadow-brand-500/30'
                  : 'text-indigo-100/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${
                    isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
                  }`}
                >
                  <Icon path={item.icon} className="h-[18px] w-[18px]" />
                </span>
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="relative flex items-center gap-3 rounded-2xl bg-white/5 p-3 ring-1 ring-white/10">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-fuchsia-500 text-sm font-bold text-white">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-indigo-200/60">{user.role}</p>
        </div>
        <button
          onClick={() => navigate('/login')}
          title="Logout"
          aria-label="Logout"
          className="rounded-lg p-2 text-indigo-200/70 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Icon path={icons.logout} className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-64 shrink-0 lg:block">{sidebar}</aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 shadow-2xl">{sidebar}</aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200/70 bg-white/70 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open menu"
            >
              <Icon path={icons.menu} />
            </button>
            <p className="text-sm font-medium text-slate-500">{today}</p>
          </div>

          <Link
            to="/dashboard/book"
            className="btn-gradient flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25"
          >
            <Icon path={icons.plus} className="h-4 w-4" />
            Book Appointment
          </Link>
        </header>

        <main className="flex-1 overflow-y-auto bg-linear-to-br from-slate-50 to-brand-50/50 p-4 sm:p-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout