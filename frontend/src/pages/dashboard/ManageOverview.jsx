import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { getStats } from '../../services/manageService'
import { capitalize, getInitials, avatarColor } from '../../utils/format'

// Progress bar clrs (status ke token ke mutabiq, DESIGN_SYSTEM.md section 2.2)
const statusBars = {
  pending: 'bg-warning-500',
  confirmed: 'bg-success-500',
  completed: 'bg-info-500',
  cancelled: 'bg-danger-500',
}

const STATUS_ORDER = ['pending', 'confirmed', 'completed', 'cancelled']

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function dayLabel(iso) {
  const date = new Date(`${iso}T00:00:00`)
  return `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${date.getDate()}`
}

function ManageOverview() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'
  const firstName = user.name.replace(/^Dr\.?\s+/i, '').split(' ')[0]
  const displayName = isAdmin ? firstName : `Dr. ${firstName}`

  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    let cancelled = false

    getStats()
      .then((data) => {
        if (!cancelled) setStats(data.stats)
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

  const cards = [
    {
      label: 'Today',
      value: stats?.today,
      icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
      gradient: 'from-primary-500 to-secondary-500',
      glow: 'shadow-primary-500/30',
    },
    {
      label: 'Pending requests',
      value: stats?.pending,
      icon: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-warning-500 to-warning-600',
      glow: 'shadow-warning-500/30',
    },
    {
      label: 'Completed',
      value: stats?.completed,
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-success-500 to-success-600',
      glow: 'shadow-success-500/30',
    },
    {
      label: 'Revenue',
      value: stats ? `Rs ${stats.revenue.toLocaleString()}` : undefined,
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      gradient: 'from-accent-500 to-pink-500',
      glow: 'shadow-accent-500/30',
    },
  ]

  const maxWeek = stats ? Math.max(1, ...stats.week.map((day) => day.total)) : 1
  const statusTotal = stats ? Object.values(stats.byStatus).reduce((sum, n) => sum + n, 0) : 0

  return (
    <div className="mx-auto max-w-5xl">
      <section className="gradient-hero relative overflow-hidden rounded-3xl p-6 text-white shadow-xl shadow-primary-600/20">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-white/10" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {getGreeting()}, {displayName}
            </h1>
            <p className="mt-1.5 text-sm text-white/80">
              {isAdmin ? 'Here is how the clinic is doing.' : 'Here is your day at a glance.'}
            </p>
          </div>

          {stats?.totals && (
            <div className="flex gap-3">
              {[
                ['Doctors', stats.totals.doctors],
                ['Patients', stats.totals.patients],
                ['Services', stats.totals.services],
              ].map(([label, value]) => (
                <div key={label} className="rounded-2xl bg-white/15 px-4 py-2.5 text-center ring-1 ring-white/25 backdrop-blur">
                  <p className="text-lg font-bold leading-none">{value}</p>
                  <p className="mt-1 text-xs uppercase tracking-wider text-white/70">{label}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {loadError && (
        <p className="mt-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">{loadError}</p>
      )}

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Card
            key={card.label}
            padding="sm"
            interactive
            className="flex items-center gap-4 hover:-translate-y-0.5"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg ${card.gradient} ${card.glow}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={card.icon} />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-xl font-extrabold leading-none text-slate-900">
                {isLoading ? '–' : card.value ?? '–'}
              </p>
              <p className="mt-1 truncate text-sm font-medium text-slate-500">{card.label}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <Card as="section" className="lg:col-span-3">
          <h2 className="text-base font-bold text-slate-900">Next 7 days</h2>
          <p className="text-xs text-slate-500">Appointments per day (cancelled ones not counted)</p>

          {stats ? (
            <div className="mt-4 flex h-44 items-end gap-3">
              {stats.week.map((day) => (
                <div key={day.date} className="flex h-full flex-1 flex-col items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-600">{day.total}</span>
                  <div className="flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-lg bg-linear-to-t from-primary-600 to-secondary-500 transition-all duration-500"
                      style={{ height: `${Math.max((day.total / maxWeek) * 100, 4)}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500">{dayLabel(day.date)}</span>
                </div>
              ))}
            </div>
          ) : (
            <Skeleton variant="block" className="mt-4 h-44" />
          )}
        </Card>

        <Card as="section" className="lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900">By status</h2>
          <p className="text-xs text-slate-500">All appointments so far</p>

          <ul className="mt-4 space-y-3.5">
            {STATUS_ORDER.map((status) => {
              const count = stats?.byStatus[status] ?? 0
              const percent = statusTotal > 0 ? (count / statusTotal) * 100 : 0
              return (
                <li key={status}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{capitalize(status)}</span>
                    <span className="font-semibold text-slate-900">{isLoading ? '–' : count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${statusBars[status]}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        </Card>
      </div>

      <Card as="section" padding="none" className="mt-4">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Today&apos;s schedule</h2>
          <Link
            to="/dashboard/manage-appointments"
            className="text-sm font-semibold text-primary-600 hover:text-primary-700 hover:underline"
          >
            All appointments
          </Link>
        </div>

        {stats && stats.todayList.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">No appointments scheduled for today.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {(stats?.todayList ?? []).map((item) => (
              <li key={item.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ${avatarColor(item.id)}`}>
                  {getInitials(item.patient)}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.patient}</p>
                  <p className="truncate text-xs text-slate-500">
                    {item.service}
                    {isAdmin && ` · ${item.doctor}`}
                  </p>
                </div>

                <p className="text-sm font-medium text-slate-700">{item.time}</p>

                <StatusBadge status={item.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

export default ManageOverview