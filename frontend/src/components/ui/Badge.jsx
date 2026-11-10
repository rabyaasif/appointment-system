const variants = {
  primary: { badge: 'bg-primary-50 text-primary-700', dot: 'bg-primary-500' },
  success: { badge: 'bg-success-50 text-success-700', dot: 'bg-success-500' },
  warning: { badge: 'bg-warning-50 text-warning-700', dot: 'bg-warning-500' },
  info: { badge: 'bg-info-50 text-info-700', dot: 'bg-info-500' },
  danger: { badge: 'bg-danger-50 text-danger-700', dot: 'bg-danger-500' },
}

function Badge({ variant = 'primary', dot = false, className = '', children }) {
  const style = variants[variant]

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge} ${className}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />}
      {children}
    </span>
  )
}

export default Badge