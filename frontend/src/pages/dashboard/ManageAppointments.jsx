import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import PageHeader from '../../components/ui/PageHeader'
import StatusBadge from '../../components/ui/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { getManagedAppointments, updateAppointmentStatus } from '../../services/manageService'
import { formatDate, capitalize, getInitials, avatarColor } from '../../utils/format'

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

const searchIcon = 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z'

function ManageAppointments() {
  const { user } = useAuth()
  const isAdmin = user.role === 'admin'

  const [appointments, setAppointments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [activeTab, setActiveTab] = useState('All')
  const [search, setSearch] = useState('')
  const [busyId, setBusyId] = useState(null)
  const [actionError, setActionError] = useState('')
  const [cancelTarget, setCancelTarget] = useState(null)

  useEffect(() => {
    let cancelled = false

    getManagedAppointments()
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

  const query = search.trim().toLowerCase()
  const filtered = appointments.filter((a) => {
    const matchTab = activeTab === 'All' || capitalize(a.status) === activeTab
    const text = `${a.patient} ${a.service} ${a.doctor}`.toLowerCase()
    return matchTab && text.includes(query)
  })

  const changeStatus = async (item, status) => {
    setBusyId(item.id)
    setActionError('')

    try {
      await updateAppointmentStatus(item.id, status)
      setAppointments((prev) => prev.map((a) => (a.id === item.id ? { ...a, status } : a)))
    } catch (error) {
      setActionError(error.message)
    } finally {
      setBusyId(null)
      setCancelTarget(null)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Appointments"
        subtitle={isAdmin ? 'All appointments across the clinic.' : 'Appointments booked with you.'}
      >
        <div className="relative w-full sm:w-72">
          <svg className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={searchIcon} />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, service or doctor..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
          />
        </div>
      </PageHeader>

      <div className="mt-4 flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${activeTab === tab
              ? 'bg-linear-to-r from-primary-600 to-secondary-600 text-white shadow-md shadow-primary-600/25'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
              }`}
          >
            {tab}
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
            >
              {countFor(tab)}
            </span>
          </button>
        ))}
      </div>

      {actionError && (
        <p className="mt-4 rounded-xl bg-danger-50 px-4 py-3 text-sm text-danger-600">{actionError}</p>
      )}

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
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No appointments found here.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {filtered.map((item) => {
            const busy = busyId === item.id
            return (
              <Card
                as="li"
                key={item.id}
                padding="sm"
                interactive
                className="flex flex-wrap items-center gap-4"
              >
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br text-sm font-bold text-white ${avatarColor(item.id)}`}
                >
                  {getInitials(item.patient)}
                </div>

                <div className="min-w-0 flex-1 basis-44">
                  <p className="truncate text-sm font-semibold text-slate-800">{item.patient}</p>
                  <p className="truncate text-xs text-slate-500">{item.patientPhone}</p>
                </div>

                <div className="min-w-0 flex-1 basis-40">
                  <p className="truncate text-sm font-medium text-slate-700">{item.service}</p>
                  {isAdmin && <p className="truncate text-xs text-slate-500">with {item.doctor}</p>}
                </div>

                <div className="w-28">
                  <p className="text-sm font-medium text-slate-700">{formatDate(item.date)}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>

                <p className="w-20 text-sm font-bold text-slate-800">Rs {item.price.toLocaleString()}</p>

                <StatusBadge status={item.status} className="w-28 justify-center" />

                <div className="flex w-44 justify-end gap-2">
                  {item.status === 'pending' && (
                    <button
                      disabled={busy}
                      onClick={() => changeStatus(item, 'confirmed')}
                      className="rounded-lg bg-success-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-success-600 disabled:opacity-60"
                    >
                      {busy ? '...' : 'Confirm'}
                    </button>
                  )}
                  {item.status === 'confirmed' && (
                    <button
                      disabled={busy}
                      onClick={() => changeStatus(item, 'completed')}
                      className="rounded-lg bg-info-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-info-600 disabled:opacity-60"
                    >
                      {busy ? '...' : 'Complete'}
                    </button>
                  )}
                  {(item.status === 'pending' || item.status === 'confirmed') && (
                    <button
                      disabled={busy}
                      onClick={() => setCancelTarget(item)}
                      className="rounded-lg border border-danger-200 px-3 py-1.5 text-xs font-semibold text-danger-600 transition-colors hover:bg-danger-50 disabled:opacity-60"
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
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => setCancelTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-danger-50 text-danger-500">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Cancel this appointment?</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {cancelTarget.service} for {cancelTarget.patient} on {formatDate(cancelTarget.date)} at{' '}
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
                onClick={() => changeStatus(cancelTarget, 'cancelled')}
                className="h-11 flex-1 rounded-xl bg-danger-500 text-sm font-semibold text-white shadow-lg shadow-danger-500/25 transition-all hover:bg-danger-600 active:scale-[0.98]"
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

export default ManageAppointments