import React, { createContext, useContext, useState, useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { supabase, supabaseConfigured } from '../lib/supabase'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [adminUser, setAdminUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    async function checkCurrentSession() {
      if (!supabaseConfigured || !supabase) {
        if (mounted) setLoading(false)
        return
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        if (sessionError) throw sessionError

        if (session?.user) {
          // Query role from public.profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id, full_name, phone, role')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profileError) {
            console.error('Error fetching admin profile:', profileError)
          }

          if (profile && profile.role === 'admin') {
            const userObj = {
              id: session.user.id,
              email: session.user.email,
              full_name: profile.full_name || 'Administrator',
              phone: profile.phone || '',
              role: 'admin'
            }
            if (mounted) setAdminUser(userObj)
          } else {
            if (mounted) setAdminUser(null)
          }
        } else {
          if (mounted) setAdminUser(null)
        }
      } catch (err) {
        console.warn('Admin session verification failed:', err)
        if (mounted) setAdminUser(null)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    checkCurrentSession()

    let authListener = null
    if (supabaseConfigured && supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          if (mounted) setAdminUser(null)
        } else if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, full_name, phone, role')
            .eq('id', session.user.id)
            .maybeSingle()

          if (profile?.role === 'admin' && mounted) {
            setAdminUser({
              id: session.user.id,
              email: session.user.email,
              full_name: profile.full_name || 'Administrator',
              phone: profile.phone || '',
              role: 'admin'
            })
          } else if (mounted) {
            setAdminUser(null)
          }
        }
      })
      authListener = data?.subscription
    }

    return () => {
      mounted = false
      if (authListener) authListener.unsubscribe()
    }
  }, [])

  const login = async (email, password) => {
    setError(null)
    setLoading(true)

    if (!supabaseConfigured || !supabase) {
      const msg = 'Supabase credentials (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not configured in your environment.'
      setError(msg)
      setLoading(false)
      throw new Error(msg)
    }

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim()
      })

      if (authErr) {
        throw new Error(authErr.message)
      }

      if (!data?.user) {
        throw new Error('Authentication failed: No user returned.')
      }

      // Verify admin role from public.profiles
      const { data: profile, error: profErr } = await supabase
        .from('profiles')
        .select('id, full_name, phone, role')
        .eq('id', data.user.id)
        .maybeSingle()

      if (profErr) {
        await supabase.auth.signOut()
        throw new Error(`Failed to verify user profile: ${profErr.message}`)
      }

      if (!profile || profile.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('Access denied. This user account does not possess the "admin" role in public.profiles.')
      }

      const userObj = {
        id: data.user.id,
        email: data.user.email,
        full_name: profile.full_name || 'Noor Administrator',
        phone: profile.phone || '',
        role: 'admin'
      }

      setAdminUser(userObj)
      setLoading(false)
      return userObj
    } catch (err) {
      setError(err.message || 'Login failed')
      setLoading(false)
      throw err
    }
  }

  const logout = async () => {
    if (supabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut()
      } catch (e) {
        console.warn('Sign out error:', e)
      }
    }
    setAdminUser(null)
  }

  return (
    <AdminAuthContext.Provider
      value={{
        adminUser,
        isAuthenticated: Boolean(adminUser),
        isAdmin: adminUser?.role === 'admin',
        loading,
        error,
        login,
        logout,
        supabaseConfigured
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export function AdminRoute({ children }) {
  const { adminUser, loading, isAdmin } = useAdminAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="admin-loading-screen">
        <div className="admin-spinner" />
        <p>Verifying Admin Authentication with Supabase...</p>
      </div>
    )
  }

  if (!adminUser || !isAdmin) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />
  }

  return children
}
