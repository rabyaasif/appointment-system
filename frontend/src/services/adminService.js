import { apiRequest } from './api'

export function createService(data) {
  return apiRequest('/admin/services', { method: 'POST', body: data })
}

export function updateService(id, data) {
  return apiRequest(`/admin/services/${id}`, { method: 'PUT', body: data })
}

export function deleteService(id) {
  return apiRequest(`/admin/services/${id}`, { method: 'DELETE' })
}

export function getDoctors() {
  return apiRequest('/admin/doctors')
}

export function createDoctor(data) {
  return apiRequest('/admin/doctors', { method: 'POST', body: data })
}

export function setDoctorServices(id, serviceIds) {
  return apiRequest(`/admin/doctors/${id}/services`, { method: 'PUT', body: { serviceIds } })
}