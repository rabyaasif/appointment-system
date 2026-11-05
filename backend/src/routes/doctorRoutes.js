import { Router } from 'express'
import { getSchedule, updateSchedule } from '../controllers/doctorController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// Sirf doctor, aur wo sirf apna schedule dekh ya badal sakta hai
router.use(requireAuth, requireRole('doctor'))

router.get('/schedule', getSchedule)
router.put('/schedule', updateSchedule)

export default router