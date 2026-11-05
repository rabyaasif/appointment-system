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


export async function getStats(req, res) {
  const isDoctor = req.user.role === 'doctor'
  const scopeSql = isDoctor ? ' AND a.doctor_id = ?' : ''
  const scopeParams = isDoctor ? [req.user.id] : []

  const today = toDateString(new Date())
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() + i)
    return toDateString(date)
  })

  // Har status ki ginti aur fees ka total
  const [statusRows] = await pool.execute(
    `SELECT a.status, COUNT(*) AS total, COALESCE(SUM(s.price), 0) AS amount
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     WHERE 1 = 1${scopeSql}
     GROUP BY a.status`,
    scopeParams
  )

  const byStatus = { pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  let revenue = 0
  for (const row of statusRows) {
    byStatus[row.status] = Number(row.total)
    if (row.status === 'completed') revenue = Number(row.amount)
  }

  // Aaj ki appointments (cancelled ke baghair)
  const [todayRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM appointments a
     WHERE a.appointment_date = ? AND a.status <> 'cancelled'${scopeSql}`,
    [today, ...scopeParams]
  )

  // Agle 7 din ka chart
  const [weekRows] = await pool.execute(
    `SELECT DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date, COUNT(*) AS total
     FROM appointments a
     WHERE a.appointment_date BETWEEN ? AND ? AND a.status <> 'cancelled'${scopeSql}
     GROUP BY a.appointment_date`,
    [days[0], days[6], ...scopeParams]
  )
  const week = days.map((date) => ({
    date,
    total: Number(weekRows.find((row) => row.date === date)?.total ?? 0),
  }))

  // Aaj ka schedule
  const [todayList] = await pool.execute(
    `SELECT a.id, p.name AS patient, d.name AS doctor, s.name AS service,
            TIME_FORMAT(a.start_time, '%h:%i %p') AS time, a.status
     FROM appointments a
     JOIN users p ON p.id = a.patient_id
     JOIN users d ON d.id = a.doctor_id
     JOIN services s ON s.id = a.service_id
     WHERE a.appointment_date = ? AND a.status <> 'cancelled'${scopeSql}
     ORDER BY a.start_time
     LIMIT 8`,
    [today, ...scopeParams]
  )

  // Poori clinic ki ginti sirf admin ke liye
  let totals = null
  if (!isDoctor) {
    const [[counts]] = await pool.execute(
      `SELECT (SELECT COUNT(*) FROM users WHERE role = 'doctor') AS doctors,
              (SELECT COUNT(*) FROM users WHERE role = 'patient') AS patients,
              (SELECT COUNT(*) FROM services) AS services`
    )
    totals = {
      doctors: Number(counts.doctors),
      patients: Number(counts.patients),
      services: Number(counts.services),
    }
  }

  res.json({
    success: true,
    stats: {
      today: Number(todayRows[0].total),
      pending: byStatus.pending,
      completed: byStatus.completed,
      revenue,
      byStatus,
      week,
      todayList,
      totals,
    },
  })
}