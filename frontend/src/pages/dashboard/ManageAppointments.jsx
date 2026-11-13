import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import PageHeader from '../../components/ui/PageHeader'
import Tabs from '../../components/ui/Tabs'
import Avatar from '../../components/ui/Avatar'
import Button from '../../components/ui/Button'
import StatusBadge from '../../components/ui/StatusBadge'
import SearchInput from '../../components/ui/SearchInput'
import IconButton from '../../components/ui/IconButton'
import { actionIcons } from '../../components/ui/icons'
import { useAuth } from '../../hooks/useAuth'
import { getManagedAppointments, updateAppointmentStatus } from '../../services/manageService'
import { formatDate, capitalize } from '../../utils/format'

const tabs = ['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled']

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
        <SearchInput value={search} onChange={setSearch} placeholder="Search patient, service or doctor..." />
      </PageHeader>

      <Tabs items={tabs} active={activeTab} onChange={setActiveTab} getCount={countFor} className="mt-4" />
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
                <Avatar name={item.patient} />

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

                <div className="flex w-32 justify-end gap-2">
                  {item.status === 'pending' && (
                    <IconButton icon={actionIcons.check} label="Confirm" variant="success" isLoading={busy} onClick={() => changeStatus(item, 'confirmed')} />
                  )}
                  {item.status === 'confirmed' && (
                    <IconButton icon={actionIcons.checkCircle} label="Complete" variant="info" isLoading={busy} onClick={() => changeStatus(item, 'completed')} />
                  )}
                  {(item.status === 'pending' || item.status === 'confirmed') && (
                    <IconButton icon={actionIcons.xCircle} label="Cancel" variant="danger" disabled={busy} onClick={() => setCancelTarget(item)} />
                  )}
                </div>
              </Card>
            )
          })}
        </ul>
      )}

      {cancelTarget && (
        <Modal onClose={() => setCancelTarget(null)} className="text-center">
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
            <Button variant="secondary" type="button" className="flex-1" onClick={() => setCancelTarget(null)}>
              Keep it
            </Button>
            <Button variant="danger" type="button" className="flex-1" onClick={() => changeStatus(cancelTarget, 'cancelled')}>
              Yes, cancel
            </Button>
          </div>
        </Modal>
      )
      }
    </div >
  )
}

export default ManageAppointments