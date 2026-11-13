const variants = {
  neutral:
    'border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-slate-300/40',
  success:
    'bg-success-50 text-success-700 hover:bg-success-500 hover:text-white focus-visible:ring-success-500/30',
  info: 'bg-info-50 text-info-700 hover:bg-info-500 hover:text-white focus-visible:ring-info-500/30',
  danger:
    'bg-danger-50 text-danger-600 hover:bg-danger-500 hover:text-white focus-visible:ring-danger-500/30',
}

function IconButton({
    icon: Icon,
  label,
  variant = 'neutral',
  type = 'button',
  disabled = false,
  isLoading = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      aria-label={label}
      disabled={disabled || isLoading}
      className={`group relative flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : (
        <Icon className="h-5 w-5" strokeWidth={1.8} />
      )}

      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-9 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        {label}
      </span>
    </button>
  )
}

export default IconButton