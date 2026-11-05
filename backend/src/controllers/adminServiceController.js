import pool from '../config/db.js'
import { validateService } from '../utils/validators.js'

function parseId(value) {
  const id = Number(value)
  return Number.isInteger(id) && id > 0 ? id : null
}

function cleanService(body) {
  return {
    name: body.name.trim(),
    category: body.category,
    description: body.description.trim(),
    duration: Number(body.duration),
    price: Number(Number(body.price).toFixed(2)),
  }
}

async function isNameTaken(name, ignoreId = 0) {
  const [rows] = await pool.execute('SELECT id FROM services WHERE name = ? AND id <> ?', [name, ignoreId])
  return rows.length > 0
}

function duplicateNameResponse(res) {
  const message = 'A service with this name already exists'
  return res.status(409).json({ success: false, message, errors: { name: message } })
}

export async function createService(req, res) {
  const body = req.body ?? {}

  const errors = validateService(body)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please fix the errors below', errors })
  }

  const service = cleanService(body)
  if (await isNameTaken(service.name)) return duplicateNameResponse(res)

  const [result] = await pool.execute(
    'INSERT INTO services (name, category, description, duration_minutes, price, created_by) VALUES (?, ?, ?, ?, ?, ?)',
    [service.name, service.category, service.description, service.duration, service.price, req.user.id]
  )

  res.status(201).json({ success: true, message: 'Service added', service: { id: result.insertId, ...service } })
}

export async function updateService(req, res) {
  const id = parseId(req.params.id)
  if (!id) return res.status(400).json({ success: false, message: 'Invalid service' })

  const [existing] = await pool.execute('SELECT id FROM services WHERE id = ?', [id])
  if (existing.length === 0) return res.status(404).json({ success: false, message: 'Service not found' })

  const body = req.body ?? {}
  const errors = validateService(body)
  if (Object.keys(errors).length > 0) {
    return res.status(400).json({ success: false, message: 'Please fix the errors below', errors })
  }

  const service = cleanService(body)
  if (await isNameTaken(service.name, id)) return duplicateNameResponse(res)

  await pool.execute(
    'UPDATE services SET name = ?, category = ?, description = ?, duration_minutes = ?, price = ? WHERE id = ?',
    [service.name, service.category, service.description, service.duration, service.price, id]
  )

  res.json({ success: true, message: 'Service updated', service: { id, ...service } })
}

export async function deleteService(req, res) {
  const id = parseId(req.params.id)
  if (!id) return res.status(400).json({ success: false, message: 'Invalid service' })

  const [existing] = await pool.execute('SELECT id FROM services WHERE id = ?', [id])
  if (existing.length === 0) return res.status(404).json({ success: false, message: 'Service not found' })

  const blockedMessage = 'This service already has appointments, so it cannot be deleted'

  const [used] = await pool.execute('SELECT COUNT(*) AS total FROM appointments WHERE service_id = ?', [id])
  if (used[0].total > 0) {
    return res.status(409).json({ success: false, message: blockedMessage })
  }

  try {
    await pool.execute('DELETE FROM services WHERE id = ?', [id])
  } catch (error) {
    // Isi dauran kisi ne appointment book kar li ho
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(409).json({ success: false, message: blockedMessage })
    }
    throw error
  }

  res.json({ success: true, message: 'Service deleted' })
}