import { Router } from 'express'
import { signup, verifyOtp, resendOtp, login, logout, me } from '../controllers/authController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.post('/signup', signup)
router.post('/verify-otp', verifyOtp)
router.post('/resend-otp', resendOtp)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', requireAuth, me)

export default router