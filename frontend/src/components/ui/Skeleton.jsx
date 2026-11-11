const variants = {
  card: 'rounded-2xl border border-slate-200/70 bg-white',
  block: 'rounded-xl bg-slate-100',
}

function Skeleton({ as: Tag = 'div', variant = 'card', className = '' }) {
  return <Tag aria-hidden="true" className={`animate-pulse ${variants[variant]} ${className}`} />
}

export default Skeleton