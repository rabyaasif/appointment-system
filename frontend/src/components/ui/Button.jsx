const base =
  'inline-flex items-center justify-center gap-2 font-semibold focus:outline-none focus-visible:ring-4 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70'

const variants = {
  primary:
    'gradient-accent text-white shadow-lg shadow-accent-500/25 hover:shadow-xl hover:shadow-accent-500/35 focus-visible:ring-accent-500/30',
  secondary:
    'border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:bg-slate-50 focus-visible:ring-slate-300/40',
  danger:
    'bg-danger-500 text-white shadow-lg shadow-danger-500/25 transition-all duration-200 hover:bg-danger-600 focus-visible:ring-danger-500/30',
  'danger-outline':
    'border border-danger-200 text-danger-600 transition-all duration-200 hover:bg-danger-50 focus-visible:ring-danger-500/30',
  success:
    'bg-success-500 text-white transition-all duration-200 hover:bg-success-600 focus-visible:ring-success-500/30',
  info: 'bg-info-500 text-white transition-all duration-200 hover:bg-info-600 focus-visible:ring-info-500/30',
}

const sizes = {
  md: 'h-11 rounded-xl px-5 text-sm',
  sm: 'rounded-lg px-3 py-1.5 text-xs',
}

function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  loadingText = 'Please wait...',
  disabled = false,
  type = 'submit',
  className = '',
  children,
  ...props
}) {
  // Link jaise tags ko type aur disabled nahi chahiye
  const buttonProps = Tag === 'button' ? { type, disabled: isLoading || disabled } : {}

  return (
    <Tag
      className={`${base} ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...buttonProps}
      {...props}
    >
      {isLoading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      )}
      {isLoading ? loadingText : children}
    </Tag>
  )
}

export default Button