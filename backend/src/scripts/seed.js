import 'dotenv/config'
import bcrypt from 'bcryptjs'
import pool from '../config/db.js'

const services = [
  { name: 'General Physician', category: 'General', description: 'Consult a general doctor for fever, flu, pain or any everyday health concern.', duration: 30, price: 1500 },
  { name: 'Follow-up Visit', category: 'General', description: 'Review your progress, reports and medicines with your doctor after treatment.', duration: 20, price: 1000 },
  { name: 'Full Body Checkup', category: 'General', description: 'A complete health screening with a doctor, covering vitals and routine checks.', duration: 45, price: 3500 },
  { name: 'Cardiologist', category: 'Specialist', description: 'Heart specialist for chest pain, blood pressure and heart health checkups.', duration: 30, price: 3000 },
  { name: 'Dermatologist', category: 'Specialist', description: 'Skin specialist for acne, allergies, hair fall and other skin concerns.', duration: 30, price: 2500 },
  { name: 'Orthopedic Consultation', category: 'Specialist', description: 'Expert advice on bone, joint, back and muscle pain.', duration: 30, price: 3000 },
  { name: 'Dental Checkup', category: 'Dental', description: 'Complete dental examination to spot cavities and gum problems early.', duration: 30, price: 1500 },
  { name: 'Teeth Cleaning', category: 'Dental', description: 'Professional cleaning and polishing for a healthy, bright smile.', duration: 45, price: 3000 },
  { name: 'Root Canal Consultation', category: 'Dental', description: 'Discuss tooth pain and treatment options with a dental specialist.', duration: 30, price: 2000 },
  { name: 'Gynecologist', category: 'Women & Child', description: "Consult a women's health specialist for checkups, care and guidance.", duration: 30, price: 3000 },
  { name: 'Pediatrician', category: 'Women & Child', description: 'Child specialist for growth, fever, infections and routine care.', duration: 30, price: 2000 },
  { name: 'Child Vaccination', category: 'Women & Child', description: 'Safe and timely vaccinations for infants and children.', duration: 20, price: 1200 },
]

const doctors = [
  { name: 'Dr. Sara Ahmed', email: 'sara.ahmed@clinic.example.com', phone: '03001000001', specialty: 'General Physician', services: ['General Physician', 'Follow-up Visit', 'Full Body Checkup'] },
  { name: 'Dr. Bilal Hussain', email: 'bilal.hussain@clinic.example.com', phone: '03001000002', specialty: 'General Physician', services: ['General Physician', 'Follow-up Visit', 'Full Body Checkup'] },
  { name: 'Dr. Usman Raza', email: 'usman.raza@clinic.example.com', phone: '03001000003', specialty: 'Cardiologist', services: ['Cardiologist'] },
  { name: 'Dr. Ayesha Noor', email: 'ayesha.noor@clinic.example.com', phone: '03001000004', specialty: 'Dermatologist', services: ['Dermatologist'] },
  { name: 'Dr. Farhan Iqbal', email: 'farhan.iqbal@clinic.example.com', phone: '03001000005', specialty: 'Orthopedic Surgeon', services: ['Orthopedic Consultation'] },
  { name: 'Dr. Hina Malik', email: 'hina.malik@clinic.example.com', phone: '03001000006', specialty: 'Dentist', services: ['Dental Checkup', 'Teeth Cleaning', 'Root Canal Consultation'] },
  { name: 'Dr. Zain Abbas', email: 'zain.abbas@clinic.example.com', phone: '03001000007', specialty: 'Dentist', services: ['Dental Checkup', 'Teeth Cleaning', 'Root Canal Consultation'] },
  { name: 'Dr. Maryam Khalid', email: 'maryam.khalid@clinic.example.com', phone: '03001000008', specialty: 'Gynecologist', services: ['Gynecologist'] },
  { name: 'Dr. Imran Shah', email: 'imran.shah@clinic.example.com', phone: '03001000009', specialty: 'Pediatrician', services: ['Pediatrician', 'Child Vaccination'] },
  { name: 'Dr. Nida Farooq', email: 'nida.farooq@clinic.example.com', phone: '03001000010', specialty: 'Pediatrician', services: ['Pediatrician', 'Child Vaccination'] },
]

async function seed() {
  const password = process.env.SEED_DOCTOR_PASSWORD
  if (!password || password.length < 8) {
    throw new Error('Set SEED_DOCTOR_PASSWORD (at least 8 characters) in backend/.env first')
  }
  const passwordHash = await bcrypt.hash(password, 12)

  for (const s of services) {
    const [existing] = await pool.execute('SELECT id FROM services WHERE name = ?', [s.name])
    if (existing.length === 0) {
      await pool.execute(
        'INSERT INTO services (name, category, description, duration_minutes, price) VALUES (?, ?, ?, ?, ?)',
        [s.name, s.category, s.description, s.duration, s.price]
      )
    }
  }

  for (const d of doctors) {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', [d.email])
    let doctorId

    if (rows.length === 0) {
      const [result] = await pool.execute(
        "INSERT INTO users (name, email, password, phone, role, specialty, email_verified) VALUES (?, ?, ?, ?, 'doctor', ?, 1)",
        [d.name, d.email, passwordHash, d.phone, d.specialty]
      )
      doctorId = result.insertId
    } else {
      doctorId = rows[0].id
    }

    for (const serviceName of d.services) {
      const [svc] = await pool.execute('SELECT id FROM services WHERE name = ?', [serviceName])
      await pool.execute('INSERT IGNORE INTO doctor_services (doctor_id, service_id) VALUES (?, ?)', [doctorId, svc[0].id])
    }

    // Peer se Hafte tak (Mon-Sat), 9 se 5
    for (let day = 1; day <= 6; day++) {
      await pool.execute(
        'INSERT IGNORE INTO doctor_availability (doctor_id, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?)',
        [doctorId, day, '09:00:00', '17:00:00']
      )
    }
  }

    // Admin account (sirf tab banta hai jab .env mein email aur password ho)
  const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.SEED_ADMIN_PASSWORD

  if (adminEmail && adminPassword) {
    if (adminPassword.length < 8) {
      throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters')
    }

    const [admins] = await pool.execute('SELECT id FROM users WHERE email = ?', [adminEmail])
    if (admins.length === 0) {
      const adminHash = await bcrypt.hash(adminPassword, 12)
      await pool.execute(
        "INSERT INTO users (name, email, password, phone, role, email_verified) VALUES (?, ?, ?, ?, 'admin', 1)",
        ['Clinic Admin', adminEmail, adminHash, '03001000000']
      )
    }
  }

  console.log('Seeding done: services, doctors, their services and weekly schedules')
}

seed()
  .then(() => pool.end())
  .catch(async (error) => {
    console.error('Seeding failed:', error.message)
    await pool.end()
    process.exit(1)
  })