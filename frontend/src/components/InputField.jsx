import { useState } from 'react'

function InputField({ label, name, type = 'text', value, onChange, error, placeholder, autoComplete }) {
  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && showPassword ? 'text' : type

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
          className={`h-11 w-full rounded-xl border bg-slate-50/60 px-4 text-sm text-slate-800 outline-none transition-all duration-200 placeholder:text-slate-400 ${
            isPassword ? 'pr-14' : ''
          } ${
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
              : 'border-slate-200 focus:border-primary-500 focus:ring-primary-500/15'
          }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 px-3 text-xs font-semibold text-slate-400 transition-colors hover:text-primary-600"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      <p className="mt-1 min-h-5 text-xs text-red-500">{error}</p>
    </div>
  )
}

export default InputField