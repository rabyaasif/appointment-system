import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import SelectField from '../../components/SelectField'
import Button from '../../components/Button'
import { getServices, getServiceDoctors, getSlots } from '../../services/serviceService'
import { createAppointment } from '../../services/appointmentService'

function toKey(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getNextDays(count) {
  return Array.from({ length: count }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return {
      key: toKey(date),
      weekday: date.toLocaleDateString('en-US', { weekday: 'short' }),
      day: date.getDate(),
      month: date.toLocaleDateString('en-US', { month: 'short' }),
      full: date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' }),
    }
  })
}

function StepTitle({ number, children, right }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-linear-to-br from-brand-600 to-violet-600 text-xs font-bold text-white">
          {number}
        </span>
        <h2 className="text-sm font-bold text-slate-900">{children}</h2>
      </div>
      {right}
    </div>
  )
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <dt className="text-slate-500">{label}</dt>
      <dd className="text-right font-semibold text-slate-800">
        {value || <span className="font-normal text-slate-300">—</span>}
      </dd>
    </div>
  )
}

function BookAppointment() {
  const [searchParams] = useSearchParams()
  const dates = useMemo(() => getNextDays(7), [])

  const [services, setServices] = useState([])
  const [servicesLoading, setServicesLoading] = useState(true)
  const [servicesError, setServicesError] = useState('')

  const [serviceId, setServiceId] = useState(searchParams.get('service') ?? '')
  const [doctorId, setDoctorId] = useState('')
  const [dateKey, setDateKey] = useState(dates[0].key)
  const [slot, setSlot] = useState('')
  const [refreshCount, setRefreshCount] = useState(0)

  const [doctorsState, setDoctorsState] = useState({ serviceId: '', list: [] })
  const [slotsState, setSlotsState] = useState({ key: '', list: [], error: '' })

  const [isLoading, setIsLoading] = useState(false)
  const [bookError, setBookError] = useState('')
  const [booked, setBooked] = useState(null)

  // Services ki list
  useEffect(() => {
    let cancelled = false

    getServices()
      .then((data) => {
        if (!cancelled) setServices(data.services)
      })
      .catch((error) => {
        if (!cancelled) setServicesError(error.message)
      })
      .finally(() => {
        if (!cancelled) setServicesLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Chuni hui service ke doctors
  useEffect(() => {
    if (!serviceId) return
    let cancelled = false

    getServiceDoctors(serviceId)
      .then((data) => {
        if (!cancelled) setDoctorsState({ serviceId, list: data.doctors })
      })
      .catch(() => {
        if (!cancelled) setDoctorsState({ serviceId, list: [] })
      })

    return () => {
      cancelled = true
    }
  }, [serviceId])

  // Doctor aur date ke free slots
  const slotsKey = serviceId && doctorId ? `${serviceId}|${doctorId}|${dateKey}|${refreshCount}` : ''

  useEffect(() => {
    if (!slotsKey) return
    let cancelled = false

    getSlots(serviceId, doctorId, dateKey)
      .then((data) => {
        if (!cancelled) setSlotsState({ key: slotsKey, list: data.slots, error: '' })
      })
      .catch((error) => {
        if (!cancelled) setSlotsState({ key: slotsKey, list: [], error: error.message })
      })

    return () => {
      cancelled = true
    }
  }, [slotsKey, serviceId, doctorId, dateKey])

  const service = services.find((s) => String(s.id) === serviceId)
  const doctorsLoading = Boolean(serviceId) && doctorsState.serviceId !== serviceId
  const doctors = doctorsState.serviceId === serviceId ? doctorsState.list : []
  const doctor = doctors.find((d) => String(d.id) === doctorId)

  const slotsReady = slotsState.key === slotsKey
  const slots = slotsReady ? slotsState.list : []
  const slotsLoading = Boolean(slotsKey) && !slotsReady
  const slotsError = slotsReady ? slotsState.error : ''

  const selectedDate = dates.find((d) => d.key === dateKey)
  const selectedSlot = slots.find((s) => s.time === slot && s.available)
  const ready = Boolean(service && doctor && selectedSlot)

  const handleServiceChange = (e) => {
    setServiceId(e.target.value)
    setDoctorId('')
    setSlot('')
    setBookError('')
  }

  const handleDoctorChange = (e) => {
    setDoctorId(e.target.value)
    setSlot('')
    setBookError('')
  }

  const handleDateChange = (key) => {
    setDateKey(key)
    setSlot('')
    setBookError('')
  }

  const handleConfirm = async () => {
    if (!ready) return
    setIsLoading(true)
    setBookError('')

    try {
      await createAppointment({
        serviceId: service.id,
        doctorId: doctor.id,
        date: dateKey,
        time: selectedSlot.time,
      })
      setBooked({
        service,
        doctor,
        date: selectedDate.full,
        slot: selectedSlot.label,
      })
    } catch (error) {
      setBookError(error.message)
      // Slot kisi aur ne le liya: slots dobara load karo
      if (error.status === 409) {
        setSlot('')
        setRefreshCount((count) => count + 1)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setBooked(null)
    setServiceId('')
    setDoctorId('')
    setDateKey(dates[0].key)
    setSlot('')
    setBookError('')
  }

  if (booked) {
    return (
      <div className="mx-auto mt-4 flex max-w-md flex-col items-center rounded-3xl border border-slate-200/70 bg-white p-8 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-500/30">
          <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900">Appointment Requested</h1>
        <p className="mt-1.5 text-sm text-slate-500">
          Your request is sent. It will show as Pending until the doctor confirms it.
        </p>

        <dl className="mt-5 w-full divide-y divide-slate-100 rounded-2xl bg-slate-50 px-5 py-1 text-sm">
          <SummaryRow label="Service" value={booked.service.name} />
          <SummaryRow label="Doctor" value={booked.doctor.name} />
          <SummaryRow label="Date" value={booked.date} />
          <SummaryRow label="Time" value={booked.slot} />
        </dl>

        <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
          <Link
            to="/dashboard/appointments"
            className="btn-gradient flex h-11 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25"
          >
            My Appointments
          </Link>
          <button
            onClick={resetForm}
            className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Book Another
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Book Appointment</h1>
      <p className="mt-1 text-sm text-slate-500">Pick a service, doctor, date and time.</p>

      {servicesError && (
        <p className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{servicesError}</p>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-5">
        <section className="space-y-4 rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm lg:col-span-3">
          <div>
            <StepTitle number={1}>Service &amp; Doctor</StepTitle>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <SelectField
                label="Service"
                name="service"
                value={service ? serviceId : ''}
                onChange={handleServiceChange}
                disabled={servicesLoading}
              >
                <option value="">{servicesLoading ? 'Loading services...' : 'Select service'}</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </SelectField>
              <SelectField
                label="Doctor"
                name="doctor"
                value={doctor ? doctorId : ''}
                onChange={handleDoctorChange}
                disabled={!service || doctorsLoading}
              >
                <option value="">
                  {!service ? 'Select a service first' : doctorsLoading ? 'Loading doctors...' : 'Select doctor'}
                </option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </SelectField>
            </div>
          </div>

          <div>
            <StepTitle number={2}>Date</StepTitle>
            <div className="mt-3 grid grid-cols-7 gap-2">
              {dates.map((d) => (
                <button
                  key={d.key}
                  onClick={() => handleDateChange(d.key)}
                  className={`flex flex-col items-center rounded-xl py-2 transition-all duration-200 ${
                    dateKey === d.key
                      ? 'bg-linear-to-br from-brand-600 to-violet-600 text-white shadow-lg shadow-brand-600/25'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-brand-500 hover:text-brand-600'
                  }`}
                >
                  <span className="text-[11px] font-medium opacity-80">{d.weekday}</span>
                  <span className="text-base font-bold leading-tight">{d.day}</span>
                  <span className="text-[11px] opacity-80">{d.month}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <StepTitle
              number={3}
              right={
                <div className="flex items-center gap-3 text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full border border-slate-300 bg-white" /> Available
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-slate-200" /> Booked
                  </span>
                </div>
              }
            >
              Time
            </StepTitle>

            <div className="mt-3 min-h-40">
              {!doctor ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 text-sm text-slate-400">
                  Select a service and doctor to see available slots
                </div>
              ) : slotsLoading ? (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-9 animate-pulse rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : slotsError ? (
                <div className="flex h-40 items-center justify-center rounded-xl bg-rose-50 px-4 text-center text-sm text-rose-600">
                  {slotsError}
                </div>
              ) : slots.length === 0 ? (
                <div className="flex h-40 items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 text-center text-sm text-slate-400">
                  The doctor is not available on this day. Please pick another date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                  {slots.map((s) => (
                    <button
                      key={s.time}
                      disabled={!s.available}
                      onClick={() => setSlot(s.time)}
                      className={`h-9 rounded-lg text-xs font-semibold transition-all duration-200 ${
                        slot === s.time
                          ? 'bg-linear-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25'
                          : !s.available
                          ? 'cursor-not-allowed bg-slate-100 text-slate-300 line-through'
                          : 'border border-slate-200 bg-white text-slate-700 hover:border-brand-500 hover:text-brand-600'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-bold text-slate-900">Appointment Summary</h2>

          <dl className="mt-2 divide-y divide-slate-100 text-sm">
            <SummaryRow label="Service" value={service?.name} />
            <SummaryRow label="Doctor" value={doctor?.name} />
            <SummaryRow label="Date" value={selectedDate.full} />
            <SummaryRow label="Time" value={selectedSlot?.label} />
            <SummaryRow label="Duration" value={service && `${service.duration} min`} />
          </dl>

          <div className="mt-auto pt-4">
            {bookError && <p className="mb-2 text-center text-xs text-rose-500">{bookError}</p>}
            <div className="mb-3 flex items-center justify-between rounded-xl bg-brand-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">Consultation Fee</span>
              <span className="text-lg font-extrabold text-brand-700">
                {service ? `Rs ${service.price.toLocaleString()}` : '—'}
              </span>
            </div>
            <Button
              type="button"
              onClick={handleConfirm}
              isLoading={isLoading}
              loadingText="Confirming..."
              disabled={!ready || isLoading}
            >
              Confirm Appointment
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}

export default BookAppointment