const AVATAR_COLORS = [
  'from-primary-500 to-violet-500',
  'from-pink-500 to-rose-500',
  'from-sky-500 to-cyan-500',
  'from-emerald-500 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-fuchsia-500 to-purple-500',
]

export function formatDate(iso) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function capitalize(text = '') {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

// "Dr. Sara Ahmed" se "SA"
export function getInitials(name = '') {
  return name
    .replace(/^Dr\.?\s+/i, '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

export function avatarColor(seed) {
  return AVATAR_COLORS[Number(seed) % AVATAR_COLORS.length]
}

// Aaj ki date 'YYYY-MM-DD' mein
export function todayKey() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}