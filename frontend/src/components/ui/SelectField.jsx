function SelectField({ label, name, value, onChange, disabled = false, hideLabel = false, size = 'md', className = '', children }) {
  return (
    <div className={className}>
      <label htmlFor={name} className={hideLabel ? 'sr-only' : 'mb-1.5 block text-sm font-medium text-slate-700'}>
        {label}
      </label>
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 pl-4 pr-10 text-sm text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {children}
        </select>
        <svg
          className={`${size === 'sm' ? 'h-10' : 'h-11'} w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/60 pl-4 pr-10 text-sm text-slate-800 outline-none transition-all duration-200 hover:border-slate-300 focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-500/15 disabled:cursor-not-allowed disabled:opacity-60`} viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  )
}

export default SelectField