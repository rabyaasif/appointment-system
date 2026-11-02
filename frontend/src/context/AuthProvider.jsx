import { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './authContext'
import { getCurrentUser, loginUser, logoutUser } from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // App khulte hi pata karo ke cookie se user pehle se logged in hai ya nahi
  useEffect(() => {
    let cancelled = false

    getCurrentUser()
      .then((data) => {
        if (!cancelled) setUser(data.user)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await loginUser(email, password)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
    }
  }, [])

  const value = useMemo(
    () => ({ user, isLoading, login, logout }),
    [user, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}