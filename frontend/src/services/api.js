const API_URL = import.meta.env.VITE_API_URL

export async function apiRequest(path, { method = 'GET', body } = {}) {
  let response

  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      // credentials: 'include' se browser login wali cookie bhejta hai
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    })
  } catch {
    const error = new Error('Cannot reach the server. Please try again.')
    error.fieldErrors = {}
    throw error
  }

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || 'Something went wrong')
    error.status = response.status
    error.code = data.code
    error.data = data
    error.fieldErrors = data.errors || {}
    throw error
  }

  return data
}