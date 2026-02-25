"use client"

import { createContext, useContext, useEffect, useMemo, useState } from "react"
import type { AuthUser } from "@/lib/types"
import { fetchMe, getStoredUser, logout as clearStoredAuth, persistAuthUser } from "@/lib/api"

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  setAuthUser: (user: AuthUser | null) => void
  logout: () => void
  refreshMe: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const existing = getStoredUser()
    if (existing && active) setUser(existing)

    fetchMe()
      .then((me) => {
        if (!active) return
        setUser(me)
      })
      .catch(() => {
        if (!active) return
        // Keep stored user for offline/demo mode; do not force logout on network failure.
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    setAuthUser(next) {
      setUser(next)
      if (next) {
        persistAuthUser(next)
      } else {
        clearStoredAuth()
      }
    },
    logout() {
      clearStoredAuth()
      setUser(null)
    },
    async refreshMe() {
      const me = await fetchMe()
      setUser(me)
    },
  }), [user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}

