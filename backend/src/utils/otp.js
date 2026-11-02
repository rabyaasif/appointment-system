import crypto from 'crypto'
import bcrypt from 'bcryptjs'

export const OTP_EXPIRY_MINUTES = 10
export const OTP_MAX_ATTEMPTS = 3

// 6 digit ka random OTP (crypto.randomInt secure random deta hai)
export function generateOtp() {
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0')
}

// OTP bhi password ki tarah hash karke save hoga
export function hashOtp(otp) {
  return bcrypt.hash(otp, 10)
}

// User ka likha OTP aur database ka hash match karta hai ya nahi
export function compareOtp(otp, otpHash) {
  return bcrypt.compare(otp, otpHash)
}