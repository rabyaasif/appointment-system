import { apiRequest } from './api'

export function getManagedAppointments() {
  return apiRequest('/manage/appointments')
}

export function updateAppointmentStatus(id, status) {
  return apiRequest(`/manage/appointments/${id}/status`, { method: 'PATCH', body: { status } })
}