const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
}

function Card({
  as: Tag = 'div',
  padding = 'md',
  interactive = false,
  className = '',
  children,
  ...props
}) {
  const base = 'rounded-2xl border border-slate-200/70 bg-white shadow-sm'
  const hover = interactive ? 'transition-all duration-200 hover:shadow-md' : ''

  return (
    <Tag className={`${base} ${paddings[padding]} ${hover} ${className}`} {...props}>
      {children}
    </Tag>
  )
}

export default Card