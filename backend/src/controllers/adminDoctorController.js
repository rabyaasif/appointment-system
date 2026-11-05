import bcrypt from 'bcryptjs'
import pool from '../config/db.js'
import { validateDoctor, cleanPhone } from '../utils/validators.js'

export async function listDoctors(req, res) {
  const [doctors] = await pool.execute(
    "SELECT id, name, email, phone, specialty FROM users WHERE role = 'doctor' ORDER BY name"
  )
  const [links] = await pool.execute('SELECT doctor_id, service_id FROM doctor_services')

  const result = doctors.map((doctor) => ({
    ...doctor,
    serviceIds: links.filter((link) => link.doctor_id === doctor.id).map((link) => link.service_id),
  }))

  res.json({ success: true, doctors: result })
}

function emailTakenResponse(res) {
  const message = 'An account with this email already exists'
  return res.status(409).json({ success: false, message, errors: { email: message } })
}

export async function createDoctor(req, res) {
  const body = req.body ?? {}

  const errors = validateDoctor(body)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please fix the errors below', errors })
  }

  const name = body.name.trim()
  const email = body.email.trim().toLowerCase()
  const phone = cleanPhone(body.phone)
  const specialty = body.specialty.trim()

  const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length > 0) return emailTakenResponse(res)

  const passwordHash = await bcrypt.hash(body.password, 12)

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Admin ne account banaya hai, is liye email verified maani jati hai
    const [result] = await connection.execute(
      "INSERT INTO users (name, email, password, phone, role, specialty, email_verified) VALUES (?, ?, ?, ?, 'doctor', ?, 1)",
      [name, email, passwordHash, phone, specialty]
    )

    // Pehla schedule: Monday se Saturday, 9 se 5
    for (let day = 1; day <= 6; day++) {
      await connection.execute(
        'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [result.insertId, day, '09:00:00', '17:00:00']
      )
    }

    await connection.commit()

    return res.status(201).json({
      success: true,
      message: 'Doctor added',
      doctor: { id: result.insertId, name, email, phone, specialty, serviceIds: [] },
    })
  } catch (error) {
    await connection.rollback()
    if (error.code === 'ER_DUP_ENTRY') return emailTakenResponse(res)
    throw error
  } finally {
    connection.release()
  }
}

export async function setDoctorServices(req, res) {
  const doctorId = Number(req.params.id)
  const { serviceIds } = req.body ?? {}

  if (!Number.isInteger(doctorId) || doctorId < 1 || !Array.isArray(serviceIds)) {
    return res.status(400).json({ success: false, message: 'Invalid request' })
  }

  const ids = [...new Set(serviceIds.map(Number))]
  if (ids.some((id) => !Number.isInteger(id) || id < 1)) {
    return res.status(400).json({ success: false, message: 'Invalid services' })
  }

  const [doctors] = await pool.execute("SELECT id FROM users WHERE id = ? AND role = 'doctor'", [doctorId])
  if (doctors.length === 0) {
    return res.status(404).json({ success: false, message: 'Doctor not found' })
  }

  if (ids.length > 0) {
    const placeholders = ids.map(() => '?').join(',')
    const [found] = await pool.execute(`SELECT id FROM services WHERE id IN (${placeholders})`, ids)
    if (found.length !== ids.length) {
      return res.status(400).json({ success: false, message: 'One or more services do not exist' })
    }
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()
    await connection.execute('DELETE FROM doctor_services WHERE doctor_id = ?', [doctorId])
    for (const serviceId of ids) {
      await connection.execute('INSERT INTO doctor_services (doctor_id, service_id) VALUES (?, ?)', [doctorId, serviceId])
    }
    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }

  res.json({ success: true, message: 'Services updated', serviceIds: ids })
}