import jwt from 'jsonwebtoken'

export const COOKIE_NAME = 'access_token'

// 1 din, .env ki JWT_EXPIRES_IN (1d) ke barabar
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000

const cookieOptions = {
  httpOnly: true, // JavaScript is cookie ko parh nahi sakti
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production', // production mein sirf https
}

// Token ke andar sirf id aur role jata hai, password ya email nahi
export function createToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  })
}

// Token sahi na ho ya expire ho chuka ho to error deta hai
export function verifyToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET)
}

export function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: COOKIE_MAX_AGE })
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, cookieOptions)
}