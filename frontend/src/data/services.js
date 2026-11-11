// Dummy data, baad mein ye backend (database) se aayega
export const services = [
  // General
  {
    id: 1,
    name: 'General Physician',
    category: 'General',
    description: 'Consult a general doctor for fever, flu, pain or any everyday health concern.',
    duration: 30,
    price: 1500,
  },
  {
    id: 2,
    name: 'Follow-up Visit',
    category: 'General',
    description: 'Review your progress, reports and medicines with your doctor after treatment.',
    duration: 20,
    price: 1000,
  },
  {
    id: 3,
    name: 'Full Body Checkup',
    category: 'General',
    description: 'A complete health screening with a doctor, covering vitals and routine checks.',
    duration: 45,
    price: 3500,
  },

  // Specialist
  {
    id: 4,
    name: 'Cardiologist',
    category: 'Specialist',
    description: 'Heart specialist for chest pain, blood pressure and heart health checkups.',
    duration: 30,
    price: 3000,
  },
  {
    id: 5,
    name: 'Dermatologist',
    category: 'Specialist',
    description: 'Skin specialist for acne, allergies, hair fall and other skin concerns.',
    duration: 30,
    price: 2500,
  },
  {
    id: 6,
    name: 'Orthopedic Consultation',
    category: 'Specialist',
    description: 'Expert advice on bone, joint, back and muscle pain.',
    duration: 30,
    price: 3000,
  },

  // Dental
  {
    id: 7,
    name: 'Dental Checkup',
    category: 'Dental',
    description: 'Complete dental examination to spot cavities and gum problems early.',
    duration: 30,
    price: 1500,
  },
  {
    id: 8,
    name: 'Teeth Cleaning',
    category: 'Dental',
    description: 'Professional cleaning and polishing for a healthy, bright smile.',
    duration: 45,
    price: 3000,
  },
  {
    id: 9,
    name: 'Root Canal Consultation',
    category: 'Dental',
    description: 'Discuss tooth pain and treatment options with a dental specialist.',
    duration: 30,
    price: 2000,
  },

  // Women & Child
  {
    id: 10,
    name: 'Gynecologist',
    category: 'Women & Child',
    description: 'Consult a women\'s health specialist for checkups, care and guidance.',
    duration: 30,
    price: 3000,
  },
  {
    id: 11,
    name: 'Pediatrician',
    category: 'Women & Child',
    description: 'Child specialist for growth, fever, infections and routine care.',
    duration: 30,
    price: 2000,
  },
  {
    id: 12,
    name: 'Child Vaccination',
    category: 'Women & Child',
    description: 'Safe and timely vaccinations for infants and children.',
    duration: 20,
    price: 1200,
  },
]

export const categories = ['All', 'General', 'Specialist', 'Dental', 'Women & Child']

export const categoryMeta = {
  General: {
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
    gradient: 'from-success-500 to-success-600',
    glow: 'shadow-success-500/30',
    badge: 'bg-success-50 text-success-600',
    soft: 'bg-success-50 text-success-500 ring-success-100',
  },
  Specialist: {
    icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z',
    gradient: 'from-primary-500 to-primary-600',
    glow: 'shadow-primary-500/30',
    badge: 'bg-primary-50 text-primary-600',
    soft: 'bg-primary-50 text-primary-500 ring-primary-100',
  },
  Dental: {
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z',
    gradient: 'from-info-500 to-info-600',
    glow: 'shadow-info-500/30',
    badge: 'bg-info-50 text-info-600',
    soft: 'bg-info-50 text-info-500 ring-info-100',
  },
  'Women & Child': {
    icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
    gradient: 'from-accent-500 to-accent-600',
    glow: 'shadow-accent-500/30',
    badge: 'bg-accent-50 text-accent-600',
    soft: 'bg-accent-50 text-accent-500 ring-accent-100',
  },
}