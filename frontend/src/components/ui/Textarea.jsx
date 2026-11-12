function Textarea({ label, name, value, onChange, error, placeholder, rows = 3 }) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`w-full resize-none rounded-xl border bg-slate-50/60 px-4 py-2.5 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 focus:bg-white focus:ring-4 ${
          error
            ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15'
            : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/15'
        }`}
      />
      <p className="mt-1 min-h-5 text-xs text-danger-500">{error}</p>
    </div>
  )
}

export default Textarea