import pool from '../config/db.js'
import { COOKIE_NAME, verifyToken } from '../utils/token.js'

// Login check: cookie mein sahi token ho to user request mein lag jata hai
export async function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME]
  if (!token) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' })
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return res.status(401).json({ success: false, message: 'Session expired. Please log in again' })
  }

  // User ko database se dobara uthate hain, taake role ya status ki tabdeeli foran lagu ho
  const [rows] = await pool.execute(
    'SELECT id, name, email, phone, role, email_verified FROM users WHERE id = ?',
    [payload.id]
  )
  const user = rows[0]
  if (!user || !user.email_verified) {
    return res.status(401).json({ success: false, message: 'Please log in to continue' })
  }

  req.user = user
  next()
}

// Role check: sirf chune hue roles ko ijazat (admin/doctor ke kaam mein use hoga)
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'You do not have permission to do this' })
    }
    next()
  }
}