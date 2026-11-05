import { Router } from 'express'
import { createService, updateService, deleteService } from '../controllers/adminServiceController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = Router()

// Sirf admin
router.use(requireAuth, requireRole('admin'))

router.post('/services', createService)
router.put('/services/:id', updateService)
router.delete('/services/:id', deleteService)

export default router