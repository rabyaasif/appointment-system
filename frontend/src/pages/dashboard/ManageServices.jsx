import { useEffect, useState } from 'react'
import InputField from '../../components/InputField'
import SelectField from '../../components/SelectField'
import Button from '../../components/Button'
import { categories, categoryMeta } from '../../data/services'
import { getServices } from '../../services/serviceService'
import { createService, updateService, deleteService } from '../../services/adminService'

const categoryOptions = categories.filter((item) => item !== 'All')
const emptyForm = { name: '', category: '', duration: '', price: '', description: '' }

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

const plusIcon = 'M12 4v16m8-8H4'
const clockIcon = 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z'

function ManageServices() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // editing: null (band), { id: null } (naya), { id: 5 } (edit)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const [deleteTarget, setDeleteTarget] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    let cancelled = false

    getServices()
      .then((data) => {
        if (!cancelled) setServices(data.services)
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
    setEditing({ id: null })
  }

  const openEdit = (service) => {
    setFormData({
      name: service.name,
      category: service.category,
      duration: String(service.duration),
      price: String(service.price),
      description: service.description,
    })
    setErrors({})
    setFormError('')
    setEditing({ id: service.id })
  }

  const closeForm = () => {
    if (!isSaving) setEditing(null)
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
    if (!formData.category) newErrors.category = 'Choose a category'
    if (!formData.duration) newErrors.duration = 'Duration is required'
    if (formData.price === '') newErrors.price = 'Price is required'
    if (!formData.description.trim()) newErrors.description = 'Description is required'
    return newErrors
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsSaving(true)
    setFormError('')

    const payload = {
      name: formData.name.trim(),
      category: formData.category,
      description: formData.description.trim(),
      duration: formData.duration,
      price: formData.price,
    }

    try {
      if (editing.id) {
        const data = await updateService(editing.id, payload)
        setServices((prev) => prev.map((s) => (s.id === editing.id ? data.service : s)))
      } else {
        const data = await createService(payload)
        setServices((prev) => [...prev, data.service])
      }
      setEditing(null)
    } catch (error) {
      const fieldErrors = error.fieldErrors || {}
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) setFormError(error.message)
    } finally {
      setIsSaving(false)
    }
  }

  const openDelete = (service) => {
    setDeleteError('')
    setDeleteTarget(service)
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError('')

    try {
      await deleteService(deleteTarget.id)
      setServices((prev) => prev.filter((s) => s.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch (error) {
      setDeleteError(error.message)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Manage Services</h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, edit or remove the services patients can book.
          </p>
        </div>

        <button
          onClick={openAdd}
          className="gradient-accent flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold text-white shadow-lg shadow-fuchsia-500/25"
        >
          <Icon path={plusIcon} className="h-4 w-4" />
          Add Service
        </button>
      </div>

      {isLoading ? (
        <ul className="mt-5 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <li key={i} className="h-[74px] animate-pulse rounded-2xl border border-slate-200/70 bg-white" />
          ))}
        </ul>
      ) : loadError ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {loadError}
        </div>
      ) : services.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No services yet. Add the first one.
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {services.map((service) => {
            const meta = categoryMeta[service.category] ?? categoryMeta.General
            return (
              <li
                key={service.id}
                className="flex flex-wrap items-center gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ${meta.soft}`}>
                  <Icon path={meta.icon} />
                </div>

                <div className="min-w-0 flex-1 basis-48">
                  <p className="truncate text-sm font-semibold text-slate-800">{service.name}</p>
                  <p className="truncate text-xs text-slate-500">{service.description}</p>
                </div>

                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                  {service.category}
                </span>

                <p className="flex w-20 items-center gap-1 text-xs text-slate-500">
                  <Icon path={clockIcon} className="h-3.5 w-3.5" />
                  {service.duration} min
                </p>

                <p className="w-24 text-sm font-bold text-slate-800">Rs {service.price.toLocaleString()}</p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openEdit(service)}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => openDelete(service)}
                    className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition-colors hover:bg-rose-50"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={closeForm} />
          <div className="relative w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-lg font-bold text-slate-900">{editing.id ? 'Edit Service' : 'Add Service'}</h2>
            <p className="mb-4 mt-1 text-sm text-slate-500">
              {editing.id ? 'Update the details below.' : 'Fill in the details of the new service.'}
            </p>

            <form onSubmit={handleSave} noValidate className="space-y-1">
              <div className="grid gap-x-4 sm:grid-cols-2">
                <InputField
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  placeholder="e.g. ENT Specialist"
                />
                <div>
                  <SelectField label="Category" name="category" value={formData.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {categoryOptions.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </SelectField>
                  <p className="mt-1 min-h-5 text-xs text-red-500">{errors.category}</p>
                </div>
              </div>

              <div className="grid gap-x-4 sm:grid-cols-2">
                <InputField
                  label="Duration (minutes)"
                  name="duration"
                  type="number"
                  value={formData.duration}
                  onChange={handleChange}
                  error={errors.duration}
                  placeholder="30"
                />
                <InputField
                  label="Price (Rs)"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  error={errors.price}
                  placeholder="2000"
                />
              </div>

              <div>
                <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-slate-700">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Short description of the service"
                  className={`w-full resize-none rounded-xl border bg-slate-50/60 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
                    errors.description
                      ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                      : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/15'
                  }`}
                />
                <p className="mt-1 min-h-5 text-xs text-red-500">{errors.description}</p>
              </div>

              {formError && <p className="text-center text-sm text-red-500">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSaving}
                  className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
                >
                  Cancel
                </button>
                <div className="flex-1">
                  <Button isLoading={isSaving} loadingText="Saving...">
                    Save Service
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50" onClick={() => !isDeleting && setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Delete this service?</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              {deleteTarget.name} will be removed for all patients.
            </p>

            {deleteError && <p className="mt-3 text-sm text-rose-500">{deleteError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="h-11 flex-1 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
              >
                Keep it
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="h-11 flex-1 rounded-xl bg-rose-500 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition-all hover:bg-rose-600 active:scale-[0.98] disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Yes, delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageServices