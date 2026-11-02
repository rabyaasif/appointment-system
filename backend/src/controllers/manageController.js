import pool from '../config/db.js'
import { toDateString } from '../utils/slots.js'

const STATUSES = ['pending', 'confirmed', 'completed', 'cancelled']

// Kis status se kis status par ja sakte hain
const ALLOWED_TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
}

export async function listAppointments(req, res) {
  const { status, date } = req.query
  const conditions = []
  const params = []

  // Doctor sirf apni appointments dekhta hai, admin sab ki
  if (req.user.role === 'doctor') {
    conditions.push('a.doctor_id = ?')
    params.push(req.user.id)
  }
  if (typeof status === 'string' && STATUSES.includes(status)) {
    conditions.push('a.status = ?')
    params.push(status)
  }
  if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    conditions.push('a.appointment_date = ?')
    params.push(date)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const [rows] = await pool.execute(
    `SELECT a.id,
            p.name AS patient,
            p.phone AS patientPhone,
            d.name AS doctor,
            d.specialty,
            s.name AS service,
            DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
            TIME_FORMAT(a.start_time, '%h:%i %p') AS time,
            s.price,
            a.status
     FROM appointments a
     JOIN users p ON p.id = a.patient_id
     JOIN users d ON d.id = a.doctor_id
     JOIN services s ON s.id = a.service_id
     ${where}
     ORDER BY a.appointment_date DESC, a.start_time DESC
     LIMIT 200`,
    params
  )

  const appointments = rows.map((row) => ({ ...row, price: Number(row.price) }))
  res.json({ success: true, appointments })
}

export async function updateStatus(req, res) {
  const id = Number(req.params.id)
  const { status } = req.body ?? {}

  if (!Number.isInteger(id) || id < 1 || !STATUSES.includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid appointment or status' })
  }

  const [rows] = await pool.execute(
    "SELECT id, doctor_id, status, DATE_FORMAT(appointment_date, '%Y-%m-%d') AS date FROM appointments WHERE id = ?",
    [id]
  )
  const appointment = rows[0]

  // Doctor ko dusre doctor ki appointment "nazar hi nahi aati"
  if (!appointment || (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id)) {
    return res.status(404).json({ success: false, message: 'Appointment not found' })
  }

  if (!ALLOWED_TRANSITIONS[appointment.status].includes(status)) {
    return res.status(409).json({
      success: false,
      message: `A ${appointment.status} appointment cannot be changed to ${status}`,
    })
  }

  if (status === 'completed' && appointment.date > toDateString(new Date())) {
    return res.status(409).json({
      success: false,
      message: 'You can complete an appointment only on or after its date',
    })
  }

  // AND status = ? se pata chalta hai ke beech mein kisi aur ne to tabdeeli nahi ki
  const [result] = await pool.execute(
    'UPDATE appointments SET status = ? WHERE id = ? AND status = ?',
    [status, id, appointment.status]
  )
  if (result.affectedRows === 0) {
    return res.status(409).json({ success: false, message: 'This appointment was just changed. Please refresh.' })
  }

  res.json({ success: true, message: `Appointment ${status}`, status })
}