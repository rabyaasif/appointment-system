import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

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
  doctors:
    'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
  clock: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
}

// Har menu ke saath likha hai kin roles ko nazar aayega
const navItems = [
  { to: '/dashboard', label: 'Overview', icon: icons.overview, end: true, roles: ['patient', 'doctor', 'admin'] },
  { to: '/dashboard/services', label: 'Services', icon: icons.services, roles: ['patient'] },
  { to: '/dashboard/book', label: 'Book Appointment', icon: icons.calendar, roles: ['patient'] },
  { to: '/dashboard/appointments', label: 'My Appointments', icon: icons.appointments, roles: ['patient'] },
  { to: '/dashboard/manage-appointments', label: 'Appointments', icon: icons.appointments, roles: ['doctor', 'admin'] },
  { to: '/dashboard/manage-services', label: 'Manage Services', icon: icons.services, roles: ['admin'] },
  { to: '/dashboard/manage-doctors', label: 'Manage Doctors', icon: icons.doctors, roles: ['admin'] },
  { to: '/dashboard/my-schedule', label: 'My Schedule', icon: icons.clock, roles: ['doctor'] },
]

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
  const { user: authUser, logout } = useAuth()

  const user = {
    name: authUser.name,
    role: authUser.role.charAt(0).toUpperCase() + authUser.role.slice(1),
    initials: authUser.name
      .replace(/^Dr\.?\s+/i, '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0].toUpperCase())
      .join(''),
  }

  const visibleNav = navItems.filter((item) => item.roles.includes(authUser.role))

  const handleLogout = async () => {
    await logout().catch(() => { })
    navigate('/login')
  }

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  const sidebar = (
    <div className="relative flex h-full flex-col overflow-hidden bg-linear-to-b from-primary-900 to-slate-950 px-4 py-6">
      <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-primary-500/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -right-16 h-56 w-56 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mb-8 flex items-center gap-3 px-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-primary-500 to-fuchsia-500 shadow-lg shadow-primary-500/30">
          <Icon path={icons.calendar} className="h-5 w-5 text-white" />
        </div>
        <span className="text-base font-bold text-white">Smart Appointment</span>
      </div>

      <p className="relative mb-2 px-3 text-xs font-semibold uppercase tracking-widest text-indigo-300/50">
        Menu
      </p>

      <nav className="relative flex-1 space-y-1.5">
        {visibleNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setOpen(false)}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-xl p-2 pr-3 text-sm font-medium transition-all duration-200 ${isActive
                ? 'bg-linear-to-r from-primary-500 to-violet-500 text-white shadow-lg shadow-primary-500/30'
                : 'text-indigo-100/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-9 w-9 items-center justify-center rounded-lg transition-colors ${isActive ? 'bg-white/20' : 'bg-white/5 group-hover:bg-white/10'
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
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-500 to-fuchsia-500 text-sm font-bold text-white">
          {user.initials}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-indigo-200/60">{user.role}</p>
        </div>
        <button
          onClick={handleLogout}
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

          {authUser.role === 'patient' && (
            <Link
              to="/dashboard/book"
              className="gradient-accent flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25"
            >
              <Icon path={icons.plus} className="h-4 w-4" />
              Book Appointment
            </Link>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-linear-to-br from-slate-50 to-primary-50/50 p-4 sm:p-6 lg:px-8 lg:py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout