// Dummy data, baad mein ye backend (database) se aayega
export const doctors = [
  { id: 1, name: 'Dr. Sara Ahmed', specialty: 'General Physician', serviceIds: [1, 2, 3] },
  { id: 2, name: 'Dr. Bilal Hussain', specialty: 'General Physician', serviceIds: [1, 2, 3] },
  { id: 3, name: 'Dr. Usman Raza', specialty: 'Cardiologist', serviceIds: [4] },
  { id: 4, name: 'Dr. Ayesha Noor', specialty: 'Dermatologist', serviceIds: [5] },
  { id: 5, name: 'Dr. Farhan Iqbal', specialty: 'Orthopedic', serviceIds: [6] },
  { id: 6, name: 'Dr. Hina Malik', specialty: 'Dentist', serviceIds: [7, 8, 9] },
  { id: 7, name: 'Dr. Zain Abbas', specialty: 'Dentist', serviceIds: [7, 8, 9] },
  { id: 8, name: 'Dr. Maryam Khalid', specialty: 'Gynecologist', serviceIds: [10] },
  { id: 9, name: 'Dr. Imran Shah', specialty: 'Pediatrician', serviceIds: [11, 12] },
  { id: 10, name: 'Dr. Nida Farooq', specialty: 'Pediatrician', serviceIds: [11, 12] },
]

// 09:00 AM se 04:30 PM tak, har 30 minute ka slot
export const timeSlots = Array.from({ length: 16 }, (_, i) => {
  const minutes = 9 * 60 + i * 30
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  const suffix = hours >= 12 ? 'PM' : 'AM'
  const hours12 = hours % 12 === 0 ? 12 : hours % 12
  return {
    label: `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${suffix}`,
    minutes,
  }
})

// Dummy booked slots (har doctor aur date ke liye fixed rehte hain).
// Baad mein ye backend se aayega.
export function isSlotBooked(doctorId, dateKey, slotLabel) {
  const text = `${doctorId}|${dateKey}|${slotLabel}`
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash * 31 + text.charCodeAt(i)) % 1000
  }
  return hash % 3 === 0
}