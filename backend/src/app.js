import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import pool from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import serviceRoutes from './routes/serviceRoutes.js'
import appointmentRoutes from './routes/appointmentRoutes.js'
import manageRoutes from './routes/manageRoutes.js'

const app = express()

// credentials: true se browser cookie bhej aur le sakta hai
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.get('/api/health', async (req, res, next) => {
  try {
    await pool.query('SELECT 1')
    res.json({ success: true, message: 'Appointment API is running', database: 'connected' })
  } catch (error) {
    next(error)
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/services', serviceRoutes)
app.use('/api/appointments', appointmentRoutes)
app.use('/api/manage', manageRoutes)

// Jo route na mile uska jawab
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// Har error yahan aakar handle hoga
app.use((err, req, res, next) => {
  console.error(err)
  const status = err.status || 500
  res.status(status).json({
    success: false,
    message: status === 500 ? 'Internal server error' : err.message,
  })
})

export default app