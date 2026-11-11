import { getInitials, avatarColor } from '../../utils/format'

const sizes = {
  sm: 'h-10 w-10 text-xs',
  md: 'h-11 w-11 text-sm',
}

function Avatar({ name, size = 'md', className = '' }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-bold text-white ${sizes[size]} ${avatarColor(name)} ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}

export default Avatar