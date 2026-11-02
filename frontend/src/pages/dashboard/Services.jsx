import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, categoryMeta } from '../../data/services'
import { getServices } from '../../services/serviceService'

function Icon({ path, className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={path} />
    </svg>
  )
}

const searchIcon = 'M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z'
const clockIcon = 'M12 8v4l3 2m6-2a9 9 0 11-18 0 9 9 0 0118 0z'

function Services() {
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

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

  const filtered = services.filter((service) => {
    const matchCategory = category === 'All' || service.category === category
    const text = `${service.name} ${service.description}`.toLowerCase()
    const matchSearch = text.includes(search.trim().toLowerCase())
    return matchCategory && matchSearch
  })

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Our Services</h1>
          <p className="mt-1 text-sm text-slate-500">Choose a service and book your slot in a few clicks.</p>
        </div>

        <div className="relative w-full sm:w-72">
          <Icon path={searchIcon} className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search services..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              category === item
                ? 'bg-linear-to-r from-brand-600 to-violet-600 text-white shadow-md shadow-brand-600/25'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200/70 bg-white" />
          ))}
        </div>
      ) : loadError ? (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-sm text-rose-600">
          {loadError}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
          No services found. Try a different search or category.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((service) => {
            const meta = categoryMeta[service.category] ?? categoryMeta.General
            return (
              <div
                key={service.id}
                className="flex flex-col rounded-2xl border border-slate-200/70 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${meta.soft}`}>
                    <Icon path={meta.icon} />
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${meta.badge}`}>
                    {service.category}
                  </span>
                </div>

                <h3 className="mt-3 text-base font-bold text-slate-900">{service.name}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{service.description}</p>

                <div className="mt-auto flex items-center justify-between pt-4">
                  <div>
                    <p className="text-lg font-extrabold leading-none text-slate-900">
                      Rs {service.price.toLocaleString()}
                    </p>
                    <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                      <Icon path={clockIcon} className="h-3.5 w-3.5" />
                      {service.duration} min
                    </p>
                  </div>

                  <Link
                    to={`/dashboard/book?service=${service.id}`}
                    className={`group flex h-10 items-center gap-1.5 rounded-xl bg-linear-to-r px-5 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:brightness-110 active:scale-[0.97] ${meta.gradient} ${meta.glow}`}
                  >
                    Book
                    <Icon
                      path="M5 12h14m-6-6l6 6-6 6"
                      className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5"
                    />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Services