import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { getMyAppointments } from '../../services/appointmentService'
import { formatDate, todayKey } from '../../utils/format'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Overview() {
  const { user } = useAuth()
  const firstName = user.name.split(' ')[0]

  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    getMyAppointments()
      .then((data) => {
        if (!cancelled) setAppointments(data.appointments)
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const today = todayKey()
  // API nayi se purani order mein deti hai, upcoming ko aane wali date ke hisaab se ulta karte hain
  const upcoming = appointments
    .filter((a) => (a.status === 'pending' || a.status === 'confirmed') && a.date >= today)
    .reverse()
  const next = upcoming[0]

  const stats = [
    {
      label: 'Upcoming',
      value: upcoming.length,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      gradient: 'from-primary-500 to-secondary-500',
      glow: 'shadow-primary-500/30',
    },
    {
      label: 'Completed',
      value: appointments.filter((a) => a.status === 'completed').length,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-success-500 to-success-600',
      glow: 'shadow-success-500/30',
    },
    {
      label: 'Pending',
      value: appointments.filter((a) => a.status === 'pending').length,
      icon: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-warning-500 to-warning-600',
      glow: 'shadow-warning-500/30',
    },
  ]

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-3xl gradient-hero p-6 text-white shadow-xl shadow-primary-600/20">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-white/10" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {getGreeting()}, {firstName}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-white/80">
              {isLoading
                ? 'Loading your appointments...'
                : upcoming.length > 0
                  ? `You have ${upcoming.length} upcoming ${upcoming.length === 1 ? 'appointment' : 'appointments'}.`
                  : 'You have no upcoming appointments. Book one in a few clicks.'}
            </p>
          </div>

          {next && (
            <div className="rounded-2xl bg-white/15 px-5 py-3 ring-1 ring-white/25 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wider text-white/70">Next appointment</p>
              <p className="mt-0.5 text-xl font-bold">{next.time}</p>
              <p className="text-xs text-white/80">
                {formatDate(next.date)} · {next.doctor}
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            padding="sm"
            interactive
            className="flex items-center gap-4 hover:-translate-y-0.5"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg ${stat.gradient} ${stat.glow}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none text-slate-900">{isLoading ? '–' : stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card as="section" padding="none" className="mt-4">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Upcoming Appointments</h2>
          <Link to="/dashboard/appointments" className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            View all
          </Link>
        </div>

        {loadError ? (
          <p className="px-6 py-8 text-center text-sm text-danger-600">{loadError}</p>
        ) : !isLoading && upcoming.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-slate-500">Nothing booked yet.</p>
            <Link
              to="/dashboard/book"
              className="gradient-accent mt-3 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25"
            >
              Book Appointment
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {upcoming.slice(0, 5).map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50">
                <Avatar name={item.doctor} size="sm" />

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.service}</p>
                  <p className="truncate text-xs text-slate-500">with {item.doctor}</p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-sm font-medium text-slate-700">{formatDate(item.date)}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>

                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default Overview