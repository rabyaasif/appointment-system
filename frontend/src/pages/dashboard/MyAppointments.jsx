import { useState } from 'react'
import { Link } from 'react-router-dom'
import { initialAppointments } from '../../data/appointments'

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const statusStyles = {
  Pending: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  Confirmed: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  Completed: { badge: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  Cancelled: { badge: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
}

function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

function MyAppointments() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [activeTab, setActiveTab] = useState('All')
  const [cancelTarget, setCancelTarget] = useState(null)

  const countFor = (tab) =>
    tab === 'All' ? appointments.length : appointments.filter((a) => a.status === tab).length

  const filtered =
    activeTab === 'All' ? appointments : appointments.filter((a) => a.status === activeTab)

  const handleCancel = () => {
    // Backend se connect baad mein hoga
    setAppointments((prev) =>
      prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: 'Cancelled' } : a))
    )
    setCancelTarget(null)
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">My Appointments</h1>
      <p className="mt-1 text-sm text-slate-500">Track, manage and cancel your bookings.</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              activeTab === tab
                ? 'bg-linear-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {tab}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {countFor(tab)}
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No appointments found here.</p>
          <Link
            to="/dashboard/book"
            className="btn-gradient mt-4 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25"
          >
            Book Appointment
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {filtered.map((item) => {
            const canCancel = item.status === 'Pending' || item.status === 'Confirmed'
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold text-white ${item.color}`}
                >
                  {item.initials}
                </div>

                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.service}</p>
                  <p className="truncate text-xs text-slate-500">with {item.doctor}</p>
                </div>

                <div className="w-28">
                  <p className="text-sm font-medium text-slate-700">{formatDate(item.date)}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>

                <p className="w-20 text-sm font-bold text-slate-800">Rs {item.price.toLocaleString()}</p>

                <span
                  className={`flex w-28 items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[item.status].badge}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${statusStyles[item.status].dot}`} />
                  {item.status}
                </span>

                <div className="flex w-20 justify-end">
                  {canCancel && (
                    <button
                      onClick={() => setCancelTarget(item)}
                      className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setCancelTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Cancel this appointment?</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {cancelTarget.service} with {cancelTarget.doctor} on {formatDate(cancelTarget.date)} at{' '}
              {cancelTarget.time}.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                className="h-11 flex-1 rounded-xl bg-rose-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:bg-rose-600 active:scale-[0.98]"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments