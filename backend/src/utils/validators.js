const EMAIL_REGEX = /^\S+@\S+\.\S+$/
const PHONE_REGEX = /^(\+92|0)3\d{9}$/

export function cleanPhone(phone = '') {
  return String(phone).replace(/[\s-]/g, '')
}

export function validateSignup({ name, email, phone, password }) {
  const errors = {}

  if (typeof name !== 'string' || name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters'
  } else if (name.trim().length > 100) {
    errors.name = 'Name is too long'
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.trim().length > 150) {
    errors.email = 'Enter a valid email address'
  }

  if (!PHONE_REGEX.test(cleanPhone(phone))) {
    errors.phone = 'Enter a valid mobile number, e.g. 03001234567'
  }

  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (password.length > 72) {
    errors.password = 'Password must be 72 characters or fewer'
  }

  return errors
}