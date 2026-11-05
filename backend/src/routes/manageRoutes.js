import { Router } from 'express'
import { listAppointments, updateStatus, getStats } from '../controllers/manageController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// Sirf doctor aur admin, patient yahan nahi aa sakta
router.use(requireAuth, requireRole('doctor', 'admin'))

router.get('/stats', getStats)
router.get('/appointments', listAppointments)
router.patch('/appointments/:id/status', updateStatus)

export default router