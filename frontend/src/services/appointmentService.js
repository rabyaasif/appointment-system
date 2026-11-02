import { apiRequest } from './api'

export function createAppointment(payload) {
  return apiRequest('/appointments', { method: 'POST', body: payload })
}

export function getMyAppointments() {
  return apiRequest('/appointments')
}

export function cancelAppointment(id) {
  return apiRequest(`/appointments/${id}/cancel`, { method: 'PATCH' })
}