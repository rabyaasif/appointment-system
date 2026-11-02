import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/AuthLayout'
import InputField from '../components/InputField'
import Button from '../components/Button'
import { signupUser } from '../services/authService'

function Signup() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
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

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address'
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '')
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^(\+92|0)3\d{9}$/.test(cleanPhone)) {
      newErrors.phone = 'Use a valid number, e.g. 03001234567'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
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

    try {
            const data = await signupUser({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.replace(/[\s-]/g, ''),
        password: formData.password,
      })
      navigate('/verify-otp', { state: { email: data.user.email, devOtp: data.devOtp } })
    } catch (error) {
      const fieldErrors = error.fieldErrors || {}
      setErrors(fieldErrors)
      // Agar kisi field ka error nahi, to general message dikhao
      if (Object.keys(fieldErrors).length === 0) {
        setFormError(error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthLayout wide>
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-slate-900">Create your account</h1>
      <p className="mb-5 mt-1.5 text-center text-sm text-slate-500">Sign up to start booking appointments.</p>

      <form onSubmit={handleSubmit} noValidate className="space-y-1">
        <div className="grid gap-x-4 sm:grid-cols-2">
          <InputField
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Your full name"
            autoComplete="name"
          />
          <InputField
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="03xxxxxxxxx"
            autoComplete="tel"
          />
        </div>

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

        <div className="grid gap-x-4 sm:grid-cols-2">
          <InputField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder="Create a password"
            autoComplete="new-password"
          />
          <InputField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            placeholder="Re-enter password"
            autoComplete="new-password"
          />
        </div>

        {formError && <p className="pt-1 text-center text-sm text-red-500">{formError}</p>}

        <div className="pt-2">
          <Button isLoading={isLoading} loadingText="Creating account...">
            Create Account
          </Button>
        </div>
      </form>

      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 hover:underline">
          Login
        </Link>
      </p>
    </AuthLayout>
  )
}

export default Signup