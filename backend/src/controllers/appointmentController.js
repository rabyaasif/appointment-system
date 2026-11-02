import pool from '../config/db.js'
import { HttpError } from '../utils/httpError.js'
import { computeSlots, minutesToTime, timeToMinutes } from '../utils/slots.js'

export async function createAppointment(req, res) {
  const { serviceId, doctorId, date, time } = req.body ?? {}
  const sId = Number(serviceId)
  const dId = Number(doctorId)

  if (
    !Number.isInteger(sId) || sId < 1 ||
    !Number.isInteger(dId) || dId < 1 ||
    typeof time !== 'string'
  ) {
    return res.status(400).json({ success: false, message: 'Please choose a service, doctor, date and time' })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Doctor ki row lock: aik waqt mein is doctor ki aik hi booking check hoti hai,
    // is se do log aik hi slot book nahi kar sakte
    const [doctorRows] = await connection.execute(
      "SELECT id FROM users WHERE id = ? AND role = 'doctor' FOR UPDATE",
      [dId]
    )
    if (doctorRows.length === 0) throw new HttpError(404, 'Doctor not found')

    const { duration, slots } = await computeSlots(connection, {
      serviceId: sId,
      doctorId: dId,
      dateString: date,
    })

    const slot = slots.find((s) => s.time === time)
    if (!slot || !slot.available) {
      throw new HttpError(409, 'This time slot is no longer available. Please pick another one.')
    }

    const start = timeToMinutes(time)
    const end = start + duration

    // Patient ki apni koi appointment usi waqt par na ho
    const [clash] = await connection.execute(
      `SELECT id FROM appointments
       WHERE patient_id = ? AND appointment_date = ? AND status <> 'cancelled'
         AND TIME_TO_SEC(start_time) DIV 60 < ? AND TIME_TO_SEC(end_time) DIV 60 > ?`,
      [req.user.id, date, end, start]
    )
    if (clash.length > 0) throw new HttpError(409, 'You already have an appointment at this time')

    const [result] = await connection.execute(
      `INSERT INTO appointments (patient_id, doctor_id, service_id, appointment_date, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [req.user.id, dId, sId, date, `${minutesToTime(start)}:00`, `${minutesToTime(end)}:00`]
    )

    await connection.commit()
    return res.status(201).json({
      success: true,
      message: 'Appointment requested',
      appointment: { id: result.insertId },
    })
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }
}

export async function listMyAppointments(req, res) {
  const [rows] = await pool.execute(
    `SELECT a.id,
            s.name AS service,
            d.name AS doctor,
            d.specialty,
            DATE_FORMAT(a.appointment_date, '%Y-%m-%d') AS date,
            TIME_FORMAT(a.start_time, '%h:%i %p') AS time,
            s.price,
            a.status
     FROM appointments a
     JOIN services s ON s.id = a.service_id
     JOIN users d ON d.id = a.doctor_id
     WHERE a.patient_id = ?
     ORDER BY a.appointment_date DESC, a.start_time DESC`,
    [req.user.id]
  )

  const appointments = rows.map((row) => ({ ...row, price: Number(row.price) }))
  res.json({ success: true, appointments })
}

export async function cancelAppointment(req, res) {
  const id = Number(req.params.id)
  if (!Number.isInteger(id) || id < 1) {
    return res.status(400).json({ success: false, message: 'Invalid appointment' })
  }

  // patient_id wali shart se koi dusre ki appointment cancel nahi kar sakta
  const [result] = await pool.execute(
    `UPDATE appointments SET status = 'cancelled'
     WHERE id = ? AND patient_id = ? AND status IN ('pending', 'confirmed')`,
    [id, req.user.id]
  )

  if (result.affectedRows === 0) {
    return res.status(404).json({ success: false, message: 'Appointment not found or cannot be cancelled' })
  }

  res.json({ success: true, message: 'Appointment cancelled' })
}