import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Avatar from '../../components/ui/Avatar'
import StatusBadge from '../../components/ui/StatusBadge'
import { getMyAppointments, cancelAppointment } from '../../services/appointmentService'
import { formatDate, capitalize } from '../../utils/format'

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

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
      <PageHeader title="My Appointments" subtitle="Track, manage and cancel your bookings." />

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} getCount={countFor} className="mt-4" />
      {isLoading ? (
        <ul className="mt-5 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton as="li" key={i} className="h-20" />
          ))}
        </ul>
      ) : loadError ? (
        <div className="mt-5 rounded-2xl border border-danger-200 bg-danger-50 p-8 text-center text-sm text-danger-600">
          {loadError}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-sm text-slate-500">No appointments found here.</p>
          <Link
            to="/dashboard/book"
            className="gradient-accent mt-4 inline-flex h-10 items-center rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25"
          >
            Book Appointment
          </Link>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {filtered.map((item) => {
            const canCancel = item.status === 'pending' || item.status === 'confirmed'
            return (
              <Card
                as="li"
                key={item.id}
                padding="sm"
                interactive
                className="flex flex-wrap items-center gap-4"
              >
                <Avatar name={item.doctor} />

                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.service}</p>
                  <p className="truncate text-xs text-slate-500">with {item.doctor}</p>
                </div>

                <div className="w-28">
                  <p className="text-sm font-medium text-slate-700">{formatDate(item.date)}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>

                <p className="w-20 text-sm font-bold text-slate-800">Rs {item.price.toLocaleString()}</p>

                <StatusBadge status={item.status} className="w-28 justify-center" />

                <div className="flex w-20 justify-end">
                  {canCancel && (
                    <button
                      onClick={() => openCancel(item)}
                      className="rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-semibold text-danger-600 transition-colors hover:bg-danger-50"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </Card>
            )
          })}
        </ul>
      )}

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !isCancelling && setCancelTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Cancel this appointment?</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {cancelTarget.service} with {cancelTarget.doctor} on {formatDate(cancelTarget.date)} at{' '}
              {cancelTarget.time}.
            </p>

            {cancelError && <p className="mt-3 text-sm text-danger-500">{cancelError}</p>}

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
                className="h-11 flex-1 rounded-xl bg-danger-500 text-sm font-semibold text-white shadow-lg shadow-danger-500/25 transition-all hover:bg-danger-600 active:scale-[0.98] disabled:opacity-60"
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