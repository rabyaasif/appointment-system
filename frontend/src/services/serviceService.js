import { apiRequest } from './api'

export function getServices() {
  return apiRequest('/services')
}

export function getServiceDoctors(serviceId) {
  return apiRequest(`/services/${serviceId}/doctors`)
}

export function getSlots(serviceId, doctorId, date) {
  return apiRequest(`/services/${serviceId}/doctors/${doctorId}/slots?date=${date}`)
}