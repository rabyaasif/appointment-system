import { Router } from 'express'
import { createAppointment, listMyAppointments, cancelAppointment } from '../controllers/appointmentController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// Abhi ye routes sirf patients ke liye hain (doctor aur admin ke baad mein banenge)
router.use(requireAuth, requireRole('patient'))

router.post('/', createAppointment)
router.get('/', listMyAppointments)
router.patch('/:id/cancel', cancelAppointment)

export default router