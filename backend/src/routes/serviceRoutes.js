import { Router } from 'express'
import { listServices, listServiceDoctors, listSlots } from '../controllers/serviceController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.get('/', requireAuth, listServices)
router.get('/:id/doctors', requireAuth, listServiceDoctors)
router.get('/:serviceId/doctors/:doctorId/slots', requireAuth, listSlots)

export default router