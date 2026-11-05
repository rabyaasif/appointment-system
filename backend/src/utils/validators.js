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


export const SERVICE_CATEGORIES = ['General', 'Specialist', 'Dental', 'Women & Child']

export function validateService(body = {}) {
  const errors = {}
  const { name, category, description, duration, price } = body

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.name = 'Name must be 2 to 100 characters'
  }

  if (!SERVICE_CATEGORIES.includes(category)) {
    errors.category = 'Choose a category'
  }

  if (typeof description !== 'string' || description.trim().length < 5 || description.trim().length > 500) {
    errors.description = 'Description must be 5 to 500 characters'
  }

  const minutes = Number(duration)
  if (!Number.isInteger(minutes) || minutes < 5 || minutes > 240) {
    errors.duration = 'Duration must be a whole number from 5 to 240 minutes'
  }

  const fee = Number(price)
  if (price === '' || price === null || price === undefined || !Number.isFinite(fee) || fee < 0 || fee > 1000000) {
    errors.price = 'Enter a valid price (0 to 1,000,000)'
  }

  return errors
}


export function validateDoctor(body = {}) {
  const errors = {}
  const { name, email, phone, specialty, password } = body

  if (typeof name !== 'string' || name.trim().length < 2 || name.trim().length > 100) {
    errors.name = 'Name must be 2 to 100 characters'
  }

  if (typeof email !== 'string' || !EMAIL_REGEX.test(email.trim()) || email.trim().length > 150) {
    errors.email = 'Enter a valid email address'
  }

  if (!PHONE_REGEX.test(cleanPhone(phone))) {
    errors.phone = 'Enter a valid mobile number, e.g. 03001234567'
  }

  if (typeof specialty !== 'string' || specialty.trim().length < 2 || specialty.trim().length > 100) {
    errors.specialty = 'Specialty must be 2 to 100 characters'
  }

  if (typeof password !== 'string' || password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  } else if (password.length > 72) {
    errors.password = 'Password must be 72 characters or fewer'
  }

  return errors
}