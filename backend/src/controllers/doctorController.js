import pool from '../config/db.js'
import { timeToMinutes, minutesToTime } from '../utils/slots.js'

export async function getSchedule(req, res) {
  const [rows] = await pool.execute(
    `SELECT day_of_week AS day,
            TIME_TO_SEC(start_time) DIV 60 AS startMin,
            TIME_TO_SEC(end_time) DIV 60 AS endMin
     FROM doctor_availability
     WHERE doctor_id = ?
     ORDER BY day_of_week`,
    [req.user.id]
  )

  const schedule = rows.map((row) => ({
    day: Number(row.day),
    start: minutesToTime(Number(row.startMin)),
    end: minutesToTime(Number(row.endMin)),
  }))

  res.json({ success: true, schedule })
}

export async function updateSchedule(req, res) {
  const { schedule } = req.body ?? {}

  if (!Array.isArray(schedule) || schedule.length > 7) {
    return res.status(400).json({ success: false, message: 'Invalid schedule' })
  }

  const errors = {}
  const clean = []
  const seen = new Set()

  for (const item of schedule) {
    const day = Number(item?.day)
    if (!Number.isInteger(day) || day < 0 || day > 6 || seen.has(day)) {
      return res.status(400).json({ success: false, message: 'Invalid schedule' })
    }
    seen.add(day)

    const start = timeToMinutes(item?.start)
    const end = timeToMinutes(item?.end)

    if (start === null || end === null || start % 30 !== 0 || end % 30 !== 0) {
      errors[day] = 'Use times in 30 minute steps'
    } else if (end <= start) {
      errors[day] = 'End time must be after start time'
    } else {
      clean.push({ day, start, end })
    }
  }

  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please fix the errors below', errors })
  }

  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    // Purana schedule hata kar naya likho
    await connection.execute('DELETE FROM doctor_availability WHERE doctor_id = ?', [req.user.id])
    for (const { day, start, end } of clean) {
      await connection.execute(
        'INSERT INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [req.user.id, day, `${minutesToTime(start)}:00`, `${minutesToTime(end)}:00`]
      )
    }

    await connection.commit()
  } catch (error) {
    await connection.rollback()
    throw error
  } finally {
    connection.release()
  }

  res.json({ success: true, message: 'Schedule saved' })
}