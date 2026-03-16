'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Toaster } from '@/components/ui/toast'
import type { User } from '@supabase/supabase-js'

// --- Auth Context ---

interface AuthContextType {
  user: User | null
  isLoading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // Return safe defaults during SSR/prerender when provider is not available
    return { user: null, isLoading: true, signOut: async () => {}, refreshUser: async () => {} }
  }
  return context
}

// --- Toast Context ---

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    // Return safe defaults during SSR/prerender when provider is not available
    return { toasts: [], addToast: () => {}, removeToast: () => {} }
  }
  return context
}

// --- Providers Component ---

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [toasts, setToasts] = useState<Toast[]>([])

  // Memoize Supabase client to prevent re-creation
  const supabase = useMemo(() => createClient(), [])

  const fetchUser = useCallback(async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    // Initial fetch
    fetchUser()

    // Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, fetchUser])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  const refreshUser = useCallback(async () => {
    await fetchUser()
  }, [fetchUser])

  // Toast logic
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prev) => [...prev, { ...toast, id }])
    
    // Auto-remove unless duration is 0
    if (toast.duration !== 0) {
      setTimeout(() => removeToast(id), toast.duration || 5000)
    }
  }, [removeToast])

  // Context values
  const authValue = useMemo(() => ({
    user,
    isLoading,
    signOut,
    refreshUser
  }), [user, isLoading, signOut, refreshUser])

  const toastValue = useMemo(() => ({
    toasts,
    addToast,
    removeToast
  }), [toasts, addToast, removeToast])

  return (
    <AuthContext.Provider value={authValue}>
      <ToastContext.Provider value={toastValue}>
        {children}
        <Toaster toasts={toasts} onRemove={removeToast} />
      </ToastContext.Provider>
    </AuthContext.Provider>
  )
}
