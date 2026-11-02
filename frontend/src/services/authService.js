import { apiRequest } from './api'

export function signupUser(userData) {
  return apiRequest('/auth/signup', { method: 'POST', body: userData })
}

export function verifyOtp(email, otp) {
  return apiRequest('/auth/verify-otp', { method: 'POST', body: { email, otp } })
}

export function resendOtp(email) {
  return apiRequest('/auth/resend-otp', { method: 'POST', body: { email } })
}

export function loginUser(email, password) {
  return apiRequest('/auth/login', { method: 'POST', body: { email, password } })
}

export function logoutUser() {
  return apiRequest('/auth/logout', { method: 'POST' })
}

export function getCurrentUser() {
  return apiRequest('/auth/me')
}