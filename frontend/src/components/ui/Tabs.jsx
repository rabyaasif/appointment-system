function Tabs({ items, active, onChange, getCount, className = '' }) {
  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {items.map((item) => {
        const isActive = active === item
        return (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${
              isActive
                ? 'gradient-primary text-white shadow-md shadow-primary-600/25'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
            }`}
          >
            {item}
            {getCount && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {getCount(item)}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default Tabs