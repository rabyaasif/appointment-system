import { apiRequest } from './api'

export function getSchedule() {
  return apiRequest('/doctor/schedule')
}

export function saveSchedule(schedule) {
  return apiRequest('/doctor/schedule', { method: 'PUT', body: { schedule } })
}