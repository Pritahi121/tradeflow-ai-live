'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isDevMode } from '@/lib/supabase'
import { devAuth, mockUser, mockSession } from '@/lib/dev-auth'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, metadata?: any) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signInWithTwitter: () => Promise<any>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInWithGoogle: async () => {},
  signInWithTwitter: async () => {},
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getInitialSession = async () => {
      if (isDevMode) {
        // In development mode, use mock data
        console.log('🚀 Running in development mode - using mock authentication')
        setSession(mockSession)
        setUser(mockUser)
        setLoading(false)
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Auth session error:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    if (!isDevMode) {
      // Listen for auth changes only in production mode
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)

          // Handle new user signup
          if (event === 'SIGNED_UP' && session?.user) {
            await handleNewUser(session.user)
          }
        }
      )

      return () => subscription.unsubscribe()
    }
  }, [])

  const handleNewUser = async (user: User) => {
    try {
      // Create client record
      const { error: clientError } = await supabase
        .from('clients')
        .insert({
          client_id: `client_${user.id.slice(0, 8)}`,
          user_id: user.id,
          name: user.user_metadata?.name || 'User',
          company: user.user_metadata?.company || 'Company',
          email: user.email
        })

      if (clientError) {
        console.error('Error creating client:', clientError)
      }

      // Create user quota record
      const { error: quotaError } = await supabase
        .from('user_quotas')
        .insert({
          user_id: user.id,
          monthly_quota: 10,
          remaining_credits: 10,
          monthly_credits: 10
        })

      if (quotaError) {
        console.error('Error creating user quota:', quotaError)
      }

    } catch (error) {
      console.error('Error in handleNewUser:', error)
    }
  }

  const signIn = async (email: string, password: string) => {
    if (isDevMode) {
      const result = await devAuth.signIn(email, password)
      if (result.data.user) {
        setUser(result.data.user)
        setSession(result.data.session)
      }
      return result
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    if (isDevMode) {
      const result = await devAuth.signUp(email, password, metadata)
      if (result.data.user) {
        setUser(result.data.user)
        setSession(result.data.session)
      }
      return result
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    })
    return { data, error }
  }

  const signInWithGoogle = async () => {
    if (isDevMode) {
      console.log('🔧 Development mode - using mock Google authentication')
      const result = await devAuth.signInWithGoogle()
      if (result.data.user) {
        setUser(result.data.user)
        setSession(result.data.session)
      }
      return result
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'openid email profile https://www.googleapis.com/auth/spreadsheets',
          // Additional options for better OAuth handling
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      if (error) {
        console.error('Google OAuth Error:', error)
        // Fallback to basic scopes if Google Sheets scope fails
        const fallbackResult = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback`,
            scopes: 'openid email profile',
            queryParams: {
              access_type: 'offline',
              prompt: 'consent'
            }
          }
        })
        return fallbackResult
      }
      
      return { data, error }
    } catch (err) {
      console.error('OAuth Error:', err)
      return { data: null, error: err }
    }
  }

  const signInWithTwitter = async () => {
    if (isDevMode) {
      console.log('🔧 Development mode - using mock Twitter authentication')
      const result = await devAuth.signInWithTwitter()
      if (result.data.user) {
        setUser(result.data.user)
        setSession(result.data.session)
      }
      return result
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    return { data, error }
  }

  const signOut = async () => {
    if (isDevMode) {
      setUser(null)
      setSession(null)
      return
    }
    
    await supabase.auth.signOut()
  }

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signInWithTwitter,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
