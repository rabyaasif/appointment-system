import { useEffect, useState } from 'react'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import PageHeader from '../../components/ui/PageHeader'
import SelectField from '../../components/ui/SelectField'
import { getSchedule, saveSchedule } from '../../services/doctorService'

// Hafte ki tarteeb Monday se Sunday (Sunday ka number 0 hai)
const WEEK = [
  { day: 1, name: 'Monday' },
  { day: 2, name: 'Tuesday' },
  { day: 3, name: 'Wednesday' },
  { day: 4, name: 'Thursday' },
  { day: 5, name: 'Friday' },
  { day: 6, name: 'Saturday' },
  { day: 0, name: 'Sunday' },
]

// 06:00 se 22:00 tak, har 30 minute ka
const TIMES = Array.from({ length: 33 }, (_, i) => {
  const minutes = 360 + i * 30
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
})

function to12h(time) {
  const [hours, minutes] = time.split(':').map(Number)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 === 0 ? 12 : hours % 12
  return `${hours12}:${String(minutes).padStart(2, '0')} ${suffix}`
}

const emptyRows = Object.fromEntries(
  WEEK.map(({ day }) => [day, { enabled: false, start: '09:00', end: '17:00' }])
)

function MySchedule() {
  const [rows, setRows] = useState(emptyRows)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [errors, setErrors] = useState({})
  const [saveError, setSaveError] = useState('')
  const [message, setMessage] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let cancelled = false

    getSchedule()
      .then((data) => {
        if (cancelled) return
        const next = { ...emptyRows }
        for (const item of data.schedule) {
          next[item.day] = { enabled: true, start: item.start, end: item.end }
        }
        setRows(next)
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

  const updateRow = (day, changes) => {
    setRows((prev) => ({ ...prev, [day]: { ...prev[day], ...changes } }))
    setErrors((prev) => ({ ...prev, [day]: '' }))
    setSaveError('')
    setMessage('')
  }

  const handleSave = async () => {
    const newErrors = {}
    const payload = []

    for (const { day } of WEEK) {
      const row = rows[day]
      if (!row.enabled) continue
      if (row.end <= row.start) newErrors[day] = 'End time must be after start time'
      payload.push({ day, start: row.start, end: row.end })
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsSaving(true)
    setSaveError('')
    setMessage('')

    try {
      await saveSchedule(payload)
      setMessage('Schedule saved. Patients will see these hours when booking.')
    } catch (error) {
      setErrors(error.fieldErrors || {})
      setSaveError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const workingDays = WEEK.filter(({ day }) => rows[day].enabled).length

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="My Schedule"
        subtitle="Choose the days and hours you are available. Appointments already booked are not affected."
      />

      {loadError ? (
        <div className="mt-5 rounded-2xl border border-danger-200 bg-danger-50 p-8 text-center text-sm text-danger-600">
          {loadError}
        </div>
      ) : isLoading ? (
        <ul className="mt-5 space-y-3">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton as="li" key={i} className="h-16" />
          ))}
        </ul>
      ) : (
        <>
          <ul className="mt-5 space-y-3">
            {WEEK.map(({ day, name }) => {
              const row = rows[day]
              return (
                <Card as="li" key={day} padding="sm">
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={row.enabled}
                      aria-label={`${name} available`}
                      onClick={() => updateRow(day, { enabled: !row.enabled })}
                      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ${row.enabled ? 'bg-linear-to-r from-primary-600 to-secodary-600' : 'bg-slate-200'
                        }`}
                    >
                      <span
                        className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${row.enabled ? 'translate-x-5' : ''
                          }`}
                      />
                    </button>

                    <p className={`w-28 text-sm font-semibold ${row.enabled ? 'text-slate-800' : 'text-slate-400'}`}>
                      {name}
                    </p>

                    {row.enabled ? (
                      <div className="flex items-center gap-2">
                        <SelectField
                          name={`start-${day}`}
                          label={`${name} start time`}
                          hideLabel
                          size="sm"
                          className="w-36"
                          value={row.start}
                          onChange={(e) => updateRow(day, { start: e.target.value })}
                        >
                          {TIMES.map((time) => (
                            <option key={time} value={time}>
                              {to12h(time)}
                            </option>
                          ))}
                        </SelectField>
                        <span className="text-sm text-slate-400">to</span>
                        <SelectField
                          name={`end-${day}`}
                          label={`${name} end time`}
                          hideLabel
                          size="sm"
                          className="w-36"
                          value={row.end}
                          onChange={(e) => updateRow(day, { end: e.target.value })}
                        >
                          {TIMES.map((time) => (
                            <option key={time} value={time}>
                              {to12h(time)}
                            </option>
                          ))}
                        </SelectField>
                      </div>
                    ) : (
                      <p className="text-sm text-slate-400">Day off</p>
                    )}
                  </div>

                  {errors[day] && <p className="mt-2 text-xs text-danger-500">{errors[day]}</p>}
                </Card>
              )
            })}
          </ul>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm">
              <p className="text-slate-500">
                Working {workingDays} {workingDays === 1 ? 'day' : 'days'} a week
              </p>
              {message && <p className="mt-1 font-medium text-success-600">{message}</p>}
              {saveError && <p className="mt-1 font-medium text-danger-500">{saveError}</p>}
            </div>

            <div className="w-full sm:w-52">
              <Button fullWidth type="button" onClick={handleSave} isLoading={isSaving} loadingText="Saving...">
                Save Schedule
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default MySchedule