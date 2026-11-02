import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { validateSignup, cleanPhone } from '../utils/validators.js'
import { generateOtp, hashOtp, compareOtp, OTP_EXPIRY_MINUTES, OTP_MAX_ATTEMPTS } from '../utils/otp.js'
import { createToken, setAuthCookie, clearAuthCookie } from '../utils/token.js'



const isDevOtpMode = () => process.env.OTP_DEV_MODE === 'true'

export async function signup(req, res) {
    const body = req.body ?? {}

    const errors = validateSignup(body)
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Please fix the errors below', errors })
    }

    const name = body.name.trim()
    const email = body.email.trim().toLowerCase()
    const phone = cleanPhone(body.phone)

    // ? wali queries SQL injection se bachati hain
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
        return res.status(409).json({
            success: false,
            message: 'An account with this email already exists',
            errors: { email: 'An account with this email already exists' },
        })
    }

    // Password aur OTP dono hash karke save honge
    const passwordHash = await bcrypt.hash(body.password, 12)
    const otp = generateOtp()
    const otpHash = await hashOtp(otp)
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

    const connection = await pool.getConnection()

    try {
        // Transaction: user aur OTP dono ban jayein, ya dono na banein
        await connection.beginTransaction()

        // Role hamesha 'patient' hai, request se role kabhi nahi lete
        const [result] = await connection.execute(
            'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
            [name, email, passwordHash, phone, 'patient']
        )

        await connection.execute(
            'INSERT INTO email_otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
            [result.insertId, otpHash, expiresAt]
        )

        await connection.commit()

        const response = {
            success: true,
            message: 'Account created. Please verify your email with the OTP.',
            user: { id: result.insertId, name, email, phone, role: 'patient', emailVerified: false },
        }

        // Sirf development mein OTP jawab mein bhejte hain (auto-fill ke liye)
        if (isDevOtpMode()) {
            response.devOtp = otp
            console.log(`[DEV] OTP for ${email}: ${otp}`)
        }

        return res.status(201).json(response)
    } catch (error) {
        await connection.rollback()

        // Do log aik hi waqt par same email se signup karein to
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                success: false,
                message: 'An account with this email already exists',
                errors: { email: 'An account with this email already exists' },
            })
        }
        throw error
    } finally {
        connection.release()
    }
}


function otpError(res, status, message) {
    return res.status(status).json({ success: false, message, errors: { otp: message } })
}

export async function verifyOtp(req, res) {
    const { email, otp } = req.body ?? {}

    if (typeof email !== 'string' || typeof otp !== 'string' || !/^\d{6}$/.test(otp.trim())) {
        return otpError(res, 400, 'Enter the 6 digit OTP')
    }

    const cleanEmail = email.trim().toLowerCase()

    const [users] = await pool.execute('SELECT id, email_verified FROM users WHERE email = ?', [cleanEmail])
    if (users.length === 0) {
        // Jaan boojh kar wohi message, taake koi email ka pata na laga sake
        return otpError(res, 400, 'Invalid or expired OTP')
    }

    const user = users[0]
    if (user.email_verified) {
        return res.status(409).json({ success: false, message: 'Email is already verified' })
    }

    const [rows] = await pool.execute(
        'SELECT id, otp_hash, expires_at, attempts FROM email_otps WHERE user_id = ? ORDER BY id DESC LIMIT 1',
        [user.id]
    )
    if (rows.length === 0) {
        return otpError(res, 400, 'No OTP found. Please request a new one.')
    }

    const record = rows[0]

    if (record.attempts >= OTP_MAX_ATTEMPTS) {
        return otpError(res, 429, 'Too many wrong attempts. Please request a new OTP.')
    }

    if (new Date(record.expires_at) < new Date()) {
        return otpError(res, 400, 'OTP has expired. Please request a new one.')
    }

    const isMatch = await compareOtp(otp.trim(), record.otp_hash)
    if (!isMatch) {
        await pool.execute('UPDATE email_otps SET attempts = attempts + 1 WHERE id = ?', [record.id])
        return otpError(res, 400, 'Incorrect OTP')
    }

    // Sahi OTP: email verify karo aur OTP delete kar do (dono aik saath)
    const connection = await pool.getConnection()
    try {
        await connection.beginTransaction()
        await connection.execute('UPDATE users SET email_verified = 1 WHERE id = ?', [user.id])
        await connection.execute('DELETE FROM email_otps WHERE user_id = ?', [user.id])
        await connection.commit()
    } catch (error) {
        await connection.rollback()
        throw error
    } finally {
        connection.release()
    }

    return res.json({ success: true, message: 'Email verified successfully' })
}


// Jo email maujood na ho uske liye bhi hash compare hota hai,
// taake response ke waqt se kisi ko email ka pata na chale
const DUMMY_HASH = bcrypt.hashSync('not-a-real-password', 12)

export async function login(req, res) {
    const { email, password } = req.body ?? {}

    const errors = {}
    if (typeof email !== 'string' || !email.trim()) errors.email = 'Email is required'
    if (typeof password !== 'string' || !password) errors.password = 'Password is required'
    if (Object.keys(errors).length > 0) {
        return res.status(400).json({ success: false, message: 'Please fix the errors below', errors })
    }

    const cleanEmail = email.trim().toLowerCase()

    const [rows] = await pool.execute(
        'SELECT id, name, email, phone, password, role, email_verified FROM users WHERE email = ?',
        [cleanEmail]
    )
    const user = rows[0]

    const isPasswordCorrect = await bcrypt.compare(password, user ? user.password : DUMMY_HASH)

    // Email galat ho ya password, jawab aik hi, taake koi email ka andaza na laga sake
    if (!user || !isPasswordCorrect) {
        return res.status(401).json({ success: false, message: 'Incorrect email or password' })
    }

    if (!user.email_verified) {
        return res.status(403).json({
            success: false,
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Please verify your email before logging in',
            email: user.email,
        })
    }

    // Token cookie mein jata hai, jawab mein nahi
    setAuthCookie(res, createToken(user))

    return res.json({
        success: true,
        message: 'Logged in successfully',
        user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role },
    })
}

export function logout(req, res) {
    clearAuthCookie(res)
    res.json({ success: true, message: 'Logged out' })
}

export function me(req, res) {
    const { id, name, email, phone, role } = req.user
    res.json({ success: true, user: { id, name, email, phone, role } })
}


const RESEND_COOLDOWN_SECONDS = 60

export async function resendOtp(req, res) {
  const { email } = req.body ?? {}
  if (typeof email !== 'string' || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Email is required' })
  }

  const cleanEmail = email.trim().toLowerCase()
  const genericResponse = {
    success: true,
    message: 'If this email needs verification, a new OTP has been sent.',
  }

  const [users] = await pool.execute('SELECT id, email_verified FROM users WHERE email = ?', [cleanEmail])
  const user = users[0]

  // Email na ho ya pehle se verify ho, dono surat mein aik jaisa jawab
  if (!user || user.email_verified) {
    return res.json(genericResponse)
  }

  // 60 second mein dobara request nahi ho sakti
  const [recent] = await pool.execute(
    'SELECT TIMESTAMPDIFF(SECOND, created_at, NOW()) AS age FROM email_otps WHERE user_id = ? ORDER BY id DESC LIMIT 1',
    [user.id]
  )
  if (recent.length > 0 && recent[0].age < RESEND_COOLDOWN_SECONDS) {
    const wait = RESEND_COOLDOWN_SECONDS - recent[0].age
    return res.status(429).json({
      success: false,
      message: `Please wait ${wait} seconds before requesting a new OTP`,
    })
  }

  const otp = generateOtp()
  const otpHash = await hashOtp(otp)
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000)

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    // Purana OTP hata kar naya banao
    await connection.execute('DELETE FROM email_otps WHERE user_id = ?', [user.id])
    await connection.execute(
      'INSERT INTO email_otps (user_id, otp_hash, expires_at) VALUES (?, ?, ?)',
      [user.id, otpHash, expiresAt]
    )
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }

  const response = { ...genericResponse }
  if (isDevOtpMode()) {
    response.devOtp = otp
    console.log(`[DEV] New OTP for ${cleanEmail}: ${otp}`)
  }

  return res.json(response)
}