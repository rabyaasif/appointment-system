import pool from '../config/db.js'
import { computeSlots } from '../utils/slots.js'

export async function listServices(req, res) {
  const [rows] = await pool.execute(
    'SELECT id, name, category, description, duration_minutes AS duration, price FROM services ORDER BY id'
  )
  // DECIMAL string ban kar aata hai, number mein badal do
  const services = rows.map((service) => ({ ...service, price: Number(service.price) }))
  res.json({ success: true, services })
}

export async function listServiceDoctors(req, res) {
  const serviceId = Number(req.params.id)
  if (!Number.isInteger(serviceId) || serviceId < 1) {
    return res.status(400).json({ success: false, message: 'Invalid service' })
  }

  const [doctors] = await pool.execute(
    `SELECT u.id, u.name, u.specialty
     FROM users u
     JOIN doctor_services ds ON ds.doctor_id = u.id
     WHERE ds.service_id = ? AND u.role = 'doctor'
     ORDER BY u.name`,
    [serviceId]
  )
  res.json({ success: true, doctors })
}

export async function listSlots(req, res) {
  const serviceId = Number(req.params.serviceId)
  const doctorId = Number(req.params.doctorId)
  if (!Number.isInteger(serviceId) || serviceId < 1 || !Number.isInteger(doctorId) || doctorId < 1) {
    return res.status(400).json({ success: false, message: 'Invalid service or doctor' })
  }

  const { slots } = await computeSlots(pool, { serviceId, doctorId, dateString: req.query.date })
  res.json({ success: true, slots })
}