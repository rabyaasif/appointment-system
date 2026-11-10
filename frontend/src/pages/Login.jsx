import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { resendOtp } from '../services/authService'
import { useAuth } from '../hooks/useAuth'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setFormError('')
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }
    if (!formData.password) {
      newErrors.password = 'Password is required'
    }
    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setIsLoading(true)
    setFormError('')
    const email = formData.email.trim().toLowerCase()

    try {
      await login(email, formData.password)
      navigate('/dashboard')
    } catch (error) {
      if (error.code === 'EMAIL_NOT_VERIFIED') {
        // Email verify nahi hui: naya OTP bhej kar OTP page par le jao
        let devOtp
        try {
          const data = await resendOtp(email)
          devOtp = data.devOtp
        } catch {
          // Cooldown ya koi aur masla: OTP page phir bhi khol do
        }
        navigate('/verify-otp', { state: { email, devOtp } })
        return
      }

      const fieldErrors = error.fieldErrors || {}
      setErrors(fieldErrors)
      if (Object.keys(fieldErrors).length === 0) {
        setFormError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">Welcome back</h1>
      <p className="mb-6 mt-1.5 text-center text-sm text-slate-500">Login to manage your appointments.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-1">
        <InputField
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="you@example.com"
          autoComplete="email"
        />
        <InputField
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          placeholder="Enter your password"
          autoComplete="current-password"
        />

        {formError && <p className="pt-1 text-center text-sm text-red-500">{formError}</p>}

        <div className="pt-2">
          <Button isLoading={isLoading} loadingText="Logging in...">
            Login
          </Button>
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
          Create one
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Login