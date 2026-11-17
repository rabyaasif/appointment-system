import { useState } from 'react'

// default: normal forms (popups, dashboard). soft: neumorphic style for login, signup and OTP only.
const fieldStyles = {
  default: {
    base: 'bg-slate-50/60 text-slate-800 placeholder:text-slate-400 focus:bg-white focus:ring-4',
    ok: 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/15',
    bad: 'border-danger-500 focus:border-danger-500 focus:ring-danger-500/15',
  },
  soft: {
    base: 'bg-surface-100 text-primary-900 shadow-soft-inset placeholder:text-secondary-300 focus:ring-2',
    ok: 'border-transparent focus:ring-primary-500/40',
    bad: 'border-danger-500 focus:ring-danger-500/40',
  },
}

function InputField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  autoComplete,
  variant = 'default',
}) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type
  const style = fieldStyles[variant]

  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          className={`h-11 w-full rounded-xl border px-4 text-sm outline-none transition-all duration-200 ${style.base} ${isPassword ? 'pr-14' : ''} ${error ? style.bad : style.ok}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 px-4 text-xs font-semibold text-slate-400 transition-colors hover:text-primary-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      <p className="mt-1 min-h-5 text-xs text-danger-500">{error}</p>
    </div>
  )
}

export default InputField