import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors({ origin: process.env.CLIENT_URL }))
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Appointment API is running' })
})

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