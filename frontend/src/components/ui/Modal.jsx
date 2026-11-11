import { useEffect } from 'react'

const sizes = {
  sm: 'max-w-sm',
  lg: 'max-w-lg',
}

function Modal({ onClose, size = 'sm', locked = false, className = '', children }) {
  // Escape dabane par band ho (jab tak locked na ho)
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape' && !locked) onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [onClose, locked])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50" onClick={() => !locked && onClose()} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative w-full ${sizes[size]} rounded-3xl bg-white p-6 shadow-2xl ${className}`}
      >
        {children}
      </div>
    </div>
  )
}

export default Modal