import { HttpError } from './httpError.js'

const SLOT_STEP_MINUTES = 30
export const MAX_DAYS_AHEAD = 14

function pad(n) {
  return String(n).padStart(2, '0')
}

export function toDateString(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

// 'YYYY-MM-DD' ko date banata hai, ghalat date (jaise 2026-02-31) par null deta hai
export function parseDateString(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null
  return date
}

function isInBookingWindow(date) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const last = new Date(today)
  last.setDate(last.getDate() + MAX_DAYS_AHEAD - 1)
  return date >= today && date <= last
}

export function timeToMinutes(time) {
  const match = /^(\d{2}):(\d{2})$/.exec(time)
  if (!match) return null
  const hours = Number(match[1])
  const mins = Number(match[2])
  if (hours > 23 || mins > 59) return null
  return hours * 60 + mins
}

export function minutesToTime(minutes) {
  return `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`
}

function minutesToLabel(minutes) {
  const hours = Math.floor(minutes / 60)
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 === 0 ? 12 : hours % 12
  return `${pad(hours12)}:${pad(minutes % 60)} ${suffix}`
}

// Doctor ke schedule aur pehle se book appointments dekh kar slots banata hai.
// db: pool ya transaction wali connection
export async function computeSlots(db, { serviceId, doctorId, dateString }) {
  const date = parseDateString(dateString)
  if (!date) throw new HttpError(400, 'Choose a valid date')
  if (!isInBookingWindow(date)) {
    throw new HttpError(400, `You can book up to ${MAX_DAYS_AHEAD} days ahead`)
  }

  const [links] = await db.execute(
    `SELECT s.duration_minutes AS duration
     FROM doctor_services ds
     JOIN services s ON s.id = ds.service_id
     JOIN users u ON u.id = ds.doctor_id
     WHERE ds.service_id = ? AND ds.doctor_id = ? AND u.role = 'doctor'`,
    [serviceId, doctorId]
  )
  if (links.length === 0) throw new HttpError(404, 'This doctor does not offer this service')
  const duration = Number(links[0].duration)

  const [schedule] = await db.execute(
    `SELECT TIME_TO_SEC(start_time) DIV 60 AS start_min, TIME_TO_SEC(end_time) DIV 60 AS end_min
     FROM doctor_availability
     WHERE doctor_id = ? AND day_of_week = ?`,
    [doctorId, date.getDay()]
  )
  if (schedule.length === 0) return { duration, slots: [] }

  const [booked] = await db.execute(
    `SELECT TIME_TO_SEC(start_time) DIV 60 AS start_min, TIME_TO_SEC(end_time) DIV 60 AS end_min
     FROM appointments
     WHERE doctor_id = ? AND appointment_date = ? AND status <> 'cancelled'`,
    [doctorId, dateString]
  )

  const now = new Date()
  const isToday = toDateString(now) === dateString
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  const dayStart = Number(schedule[0].start_min)
  const dayEnd = Number(schedule[0].end_min)

  const slots = []
  for (let start = dayStart; start + duration <= dayEnd; start += SLOT_STEP_MINUTES) {
    const end = start + duration
    const isPast = isToday && start <= nowMinutes
    // Overlap: purani appointment slot ke andar ya usse takraye
    const isTaken = booked.some((b) => Number(b.start_min) < end && Number(b.end_min) > start)

    slots.push({
      time: minutesToTime(start),
      label: minutesToLabel(start),
      available: !isPast && !isTaken,
    })
  }

  return { duration, slots }
}