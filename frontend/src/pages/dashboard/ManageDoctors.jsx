import { useEffect, useState } from 'react'
import Card from '../../components/ui/Card'
import Skeleton from '../../components/ui/Skeleton'
import PageHeader from '../../components/ui/PageHeader'
import Badge from '../../components/ui/Badge'
import Avatar from '../../components/ui/Avatar'
import Modal from '../../components/ui/Modal'
import InputField from '../../components/InputField'
import Button from '../../components/Button'
import { getServices } from '../../services/serviceService'
import { getDoctors, createDoctor, setDoctorServices } from '../../services/adminService'

const emptyForm = { name: '', specialty: '', email: '', phone: '', password: '' }
const plusIcon = 'M12 4v16m8-8H4'

function ManageDoctors() {
  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // Naya doctor add karne wala form
  const [showAdd, setShowAdd] = useState(false)
  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Doctor ko services dene wala popup
  const [serviceTarget, setServiceTarget] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [isSavingServices, setIsSavingServices] = useState(false)
  const [servicesError, setServicesError] = useState('')

  useEffect(() => {
    let cancelled = false

    Promise.all([getDoctors(), getServices()])
      .then(([doctorData, serviceData]) => {
        if (cancelled) return
        setDoctors(doctorData.doctors)
        setServices(serviceData.services)
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

  const openAdd = () => {
    setFormData(emptyForm)
    setErrors({})
    setFormError('')
    setShowAdd(true)
  }

  const closeAdd = () => {
    if (!isSaving) setShowAdd(false)
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Name is required'
    if (!formData.specialty.trim()) newErrors.specialty = 'Specialty is required'
    if (!formData.email.trim()) newErrors.email = 'Email is required'
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required'
    if (!formData.password) newErrors.password = 'Password is required'
    return newErrors
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSaving(true)
    setFormError('')

    try {
      const data = await createDoctor({
        name: formData.name.trim(),
        specialty: formData.specialty.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/[\s-]/g, ''),
        password: formData.password,
      })
      setDoctors((prev) => [...prev, data.doctor].sort((a, b) => a.name.localeCompare(b.name)))
      setShowAdd(false)
    } catch (error) {
      const fieldErrors = error.fieldErrors || {}
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) setFormError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openServices = (doctor) => {
    setServicesError('')
    setSelectedIds(doctor.serviceIds)
    setServiceTarget(doctor)
  }

  const toggleService = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  const handleSaveServices = async () => {
    setIsSavingServices(true)
    setServicesError('')

    try {
      const data = await setDoctorServices(serviceTarget.id, selectedIds)
      setDoctors((prev) =>
        prev.map((d) => (d.id === serviceTarget.id ? { ...d, serviceIds: data.serviceIds } : d))
      )
      setServiceTarget(null)
    } catch (error) {
      setServicesError(error.message)
    } finally {
      setIsSavingServices(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader title="Manage Doctors" subtitle="Add doctors and choose which services each one offers.">
        <button
          onClick={openAdd}
          className="gradient-accent flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-accent-500/25"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={plusIcon} />
          </svg>
          Add Doctor
        </button>
      </PageHeader>

      {isLoading ? (
        <ul className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton as="li" key={i} className="h-20" />
          ))}
        </ul>
      ) : loadError ? (
        <div className="mt-5 rounded-2xl border border-danger-200 bg-danger-50 p-8 text-center text-sm text-danger-600">
          {loadError}
        </div>
      ) : doctors.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No doctors yet. Add the first one.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {doctors.map((doctor) => (
            <Card
              as="li"
              key={doctor.id}
              padding="sm"
              interactive
              className="flex flex-wrap items-center gap-4"
            >
              <Avatar name={doctor.name} />

              <div className="min-w-0 flex-1 basis-44">
                <p className="truncate text-sm font-semibold text-slate-800">{doctor.name}</p>
                <p className="truncate text-xs text-slate-500">{doctor.specialty}</p>
              </div>

              <div className="min-w-0 flex-1 basis-48">
                <p className="truncate text-sm text-slate-700">{doctor.email}</p>
                <p className="truncate text-xs text-slate-500">{doctor.phone}</p>
              </div>

              <Badge variant={doctor.serviceIds.length > 0 ? 'primary' : 'warning'}>
                {doctor.serviceIds.length > 0
                  ? `${doctor.serviceIds.length} ${doctor.serviceIds.length === 1 ? 'service' : 'services'}`
                  : 'No services'}
              </Badge>

              <button
                onClick={() => openServices(doctor)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
              >
                Manage Services
              </button>
            </Card>
          ))}
        </ul>
      )}

      {showAdd && (
        <Modal onClose={closeAdd} locked={isSaving} size="lg">
            <h2 className="text-lg font-bold text-slate-900">Add Doctor</h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              The doctor logs in with this email and password. Share them privately.
            </p>

            <form onSubmit={handleAdd} noValidate className="space-y-1">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <InputField
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="Dr. Full Name"
                />
                <InputField
                  label="Specialty"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleChange}
                  error={errors.specialty}
                  placeholder="e.g. ENT Specialist"
                />
              </div>

              <div className="grid gap-x-4 sm:grid-cols-2">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  placeholder="doctor@clinic.com"
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  error={errors.phone}
                  placeholder="03001234567"
                />
              </div>

              <InputField
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />

              {formError && <p className="text-center text-sm text-danger-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAdd}
                  disabled={isSaving}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <Button isLoading={isSaving} loadingText="Adding...">
                    Add Doctor
                  </Button>
                </div>
              </div>
            </form>
         </Modal>
      )}

      {serviceTarget && (
        <Modal onClose={() => setServiceTarget(null)} locked={isSavingServices} size="lg">
            <h2 className="text-lg font-bold text-slate-900">Services for {serviceTarget.name}</h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              Patients can book this doctor only for the selected services.
            </p>

            <div className="grid max-h-72 gap-2 overflow-y-auto pr-1 sm:grid-cols-2">
              {services.map((service) => {
                const checked = selectedIds.includes(service.id)
                return (
                  <label
                    key={service.id}
                    className={`flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${checked
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service.id)}
                      className="h-4 w-4 accent-primary-600"
                    />
                    <span className="truncate">{service.name}</span>
                  </label>
                )
              })}
            </div>

            {servicesError && <p className="mt-3 text-center text-sm text-danger-500">{servicesError}</p>}

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setServiceTarget(null)}
                disabled={isSavingServices}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>
              <div className="flex-1">
                <Button type="button" onClick={handleSaveServices} isLoading={isSavingServices} loadingText="Saving...">
                  Save Services
                </Button>
              </div>
            </div>
         </Modal>
      )}
    </div>
  )
}

export default ManageDoctors