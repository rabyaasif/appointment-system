import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyAppointments, cancelAppointment } from '../../services/appointmentService'
import { formatDate, capitalize, getInitials, avatarColor } from '../../utils/format'

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const statusStyles = {
  pending: { badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' },
  confirmed: { badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
  completed: { badge: 'bg-sky-50 text-sky-700', dot: 'bg-sky-500' },
  cancelled: { badge: 'bg-rose-50 text-rose-700', dot: 'bg-rose-500' },
}

function MyAppointments() {
  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [cancelTarget, setCancelTarget] = useState(null)
  const [isCancelling, setIsCancelling] = useState(false)
  const [cancelError, setCancelError] = useState('')

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

  const countFor = (tab) =>
    tab === 'All' ? appointments.length : appointments.filter((a) => capitalize(a.status) === tab).length

  const filtered =
    activeTab === 'All' ? appointments : appointments.filter((a) => capitalize(a.status) === activeTab)

  const openCancel = (item) => {
    setCancelError('')
    setCancelTarget(item)
  }

  const handleCancel = async () => {
    setIsCancelling(true)
    setCancelError('')

    try {
      await cancelAppointment(cancelTarget.id)
      setAppointments((prev) =>
        prev.map((a) => (a.id === cancelTarget.id ? { ...a, status: 'cancelled' } : a))
      )
      setCancelTarget(null)
    } catch (error) {
      setCancelError(error.message)
    } finally {
      setIsCancelling(false)
    }
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
                ? 'bg-linear-to-r from-primary-600 to-violet-600 text-white shadow-md shadow-primary-600/25'
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

      {isLoading ? (
        <ul className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <li key={i} className="h-[74px] animate-pulse rounded-2xl border border-slate-200/70 bg-white" />
          ))}
        </ul>
      ) : loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {loadError}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No appointments found here.</p>
          <Link
            to="/dashboard/book"
            className="gradient-accent mt-4 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25"
          >
            Book Appointment
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {filtered.map((item) => {
            const canCancel = item.status === 'pending' || item.status === 'confirmed'
            return (
              <li
                key={item.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold text-white ${avatarColor(item.id)}`}
                >
                  {getInitials(item.doctor)}
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
                  {capitalize(item.status)}
                </span>

                <div className="flex w-20 justify-end">
                  {canCancel && (
                    <button
                      onClick={() => openCancel(item)}
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
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !isCancelling && setCancelTarget(null)} />
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

            {cancelError && <p className="mt-3 text-sm text-rose-500">{cancelError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setCancelTarget(null)}
                disabled={isCancelling}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Keep it
              </button>
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="h-11 flex-1 rounded-xl bg-rose-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:bg-rose-600 active:scale-[0.98] disabled:opacity-60"
              >
                {isCancelling ? 'Cancelling...' : 'Yes, cancel'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MyAppointments