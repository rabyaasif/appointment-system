import { Link } from 'react-router-dom'

const user = { firstName: 'Ayesha' }

const stats = [
  {
    label: 'Upcoming',
    value: 2,
    icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
    gradient: 'from-brand-500 to-violet-500',
    glow: 'shadow-brand-500/30',
  },
  {
    label: 'Completed',
    value: 8,
    icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
    gradient: 'from-emerald-400 to-teal-500',
    glow: 'shadow-emerald-500/30',
  },
  {
    label: 'Pending',
    value: 1,
    icon: 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z',
    gradient: 'from-amber-400 to-orange-500',
    glow: 'shadow-orange-500/30',
  },
]

const upcoming = [
  { id: 1, service: 'General Physician', provider: 'Dr. Sara Ahmed', initials: 'SA', color: 'from-brand-500 to-violet-500', date: 'Mon, 3 Nov', time: '10:30 AM', status: 'Confirmed' },
  { id: 2, service: 'Dental Checkup', provider: 'Dr. Hina Malik', initials: 'HM', color: 'from-pink-500 to-rose-500', date: 'Wed, 5 Nov', time: '02:00 PM', status: 'Pending' },
  { id: 3, service: 'Cardiologist', provider: 'Dr. Usman Raza', initials: 'UR', color: 'from-sky-500 to-cyan-500', date: 'Fri, 7 Nov', time: '11:15 AM', status: 'Confirmed' },
]

const statusStyles = {
  Confirmed: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Pending: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function Overview() {
  const next = upcoming[0]

  return (
    <div className="mx-auto max-w-5xl">
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-r from-brand-600 via-violet-600 to-fuchsia-500 p-6 text-white shadow-xl shadow-brand-600/20">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/10" />
        <div className="pointer-events-none absolute -bottom-20 right-40 h-48 w-48 rounded-full bg-white/10" />

        <div className="relative flex flex-wrap items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              {getGreeting()}, {user.firstName}
            </h1>
            <p className="mt-1.5 max-w-md text-sm text-white/80">
              You have {upcoming.length} upcoming appointments. Stay on top of your schedule from here.
            </p>
          </div>

          <div className="rounded-2xl bg-white/15 px-5 py-3 ring-1 ring-white/25 backdrop-blur">
            <p className="text-xs font-medium uppercase tracking-wider text-white/70">Next appointment</p>
            <p className="mt-0.5 text-xl font-bold">{next.time}</p>
            <p className="text-xs text-white/80">
              {next.date} · {next.provider}
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br text-white shadow-lg ${stat.gradient} ${stat.glow}`}>
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-extrabold leading-none text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="mt-4 rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">Upcoming Appointments</h2>
          <Link to="/dashboard/appointments" className="text-sm font-semibold text-brand-600 hover:text-brand-700 hover:underline">
            View all
          </Link>
        </div>

        <ul className="divide-y divide-slate-100">
          {upcoming.map((item) => (
            <li key={item.id} className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-slate-50">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-xs font-bold text-white ${item.color}`}>
                {item.initials}
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{item.service}</p>
                <p className="truncate text-xs text-slate-500">with {item.provider}</p>
              </div>

              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-slate-700">{item.date}</p>
                <p className="text-xs text-slate-500">{item.time}</p>
              </div>

              <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status].badge}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[item.status].dot}`} />
                {item.status}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

export default Overview