import { useRef, useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import Button from '../components/Button'
import { verifyOtp } from '../services/authService'

const OTP_LENGTH = 6

function VerifyOtp() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const email = state?.email
  const devOtp = state?.devOtp

  // Development mein signup se OTP aata hai, wo khud bhar jata hai
  const [digits, setDigits] = useState(() =>
    devOtp && devOtp.length === OTP_LENGTH ? devOtp.split('') : Array(OTP_LENGTH).fill('')
  )
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const inputsRef = useRef([])

  // Email ke baghair is page ka koi faida nahi, signup par wapas bhejo
  if (!email) {
    return <Navigate to="/signup" replace />
  }

  const focusInput = (index) => inputsRef.current[index]?.focus()

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1)
    setDigits((prev) => {
      const next = [...prev]
      next[index] = digit
      return next
    })
    setError('')
    if (digit && index < OTP_LENGTH - 1) focusInput(index + 1)
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) focusInput(index - 1)
    if (e.key === 'ArrowLeft' && index > 0) focusInput(index - 1)
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) focusInput(index + 1)
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
    if (!pasted) return
    const next = Array(OTP_LENGTH).fill('')
    pasted.split('').forEach((d, i) => {
      next[i] = d
    })
    setDigits(next)
    setError('')
    focusInput(Math.min(pasted.length, OTP_LENGTH - 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const otp = digits.join('')
    if (otp.length < OTP_LENGTH) {
      setError('Enter the 6 digit OTP')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      await verifyOtp(email, otp)
      navigate('/login')
    } catch (err) {
      setError(err.fieldErrors?.otp || err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      <h1 className="mt-4 text-center text-2xl font-extrabold tracking-tight text-slate-900">Verify your email</h1>
      <p className="mb-6 mt-1.5 text-center text-sm text-slate-500">
        Enter the 6 digit code for <span className="font-semibold text-slate-700">{email}</span>
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputsRef.current[index] = el
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onFocus={(e) => e.target.select()}
              aria-label={`Digit ${index + 1}`}
              className={`h-13 w-11 rounded-xl border bg-slate-50/60 text-center text-xl font-bold text-slate-800 outline-none transition-all duration-200 focus:bg-white focus:ring-4 ${
                error
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/15'
              }`}
            />
          ))}
        </div>

        <p className="mt-3 min-h-5 text-center text-sm text-red-500">{error}</p>

        {devOtp && (
          <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-center text-xs text-amber-700">
            Development mode: the OTP is filled in for you.
          </p>
        )}

        <div className="pt-1">
          <Button isLoading={isLoading} loadingText="Verifying...">
            Verify Email
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Back to Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default VerifyOtp