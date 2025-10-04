'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase, isDevMode } from '@/lib/supabase'
import { Loader2 } from 'lucide-react'

export default function AuthCallback() {
  const router = useRouter()

  useEffect(() => {
    const handleAuthCallback = async () => {
      // In development mode, redirect immediately to dashboard
      if (isDevMode) {
        console.log('🔄 Development mode - redirecting to dashboard')
        setTimeout(() => {
          router.push('/dashboard')
        }, 1000) // Small delay to show the loading state
        return
      }

      try {
        // Handle OAuth callback from Supabase
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('OAuth callback error:', error)
          // Redirect to login with specific error
          const errorMessage = error.message.includes('access_denied') 
            ? 'oauth_callback_failed' 
            : 'callback_error'
          router.push(`/login?error=${errorMessage}`)
          return
        }

        if (data?.session?.user) {
          console.log('✅ OAuth successful, redirecting to dashboard')
          // Successful login - redirect to dashboard
          router.push('/dashboard')
        } else {
          console.log('❌ No session found, redirecting to login')
          // No session - redirect to login
          router.push('/login?error=no_session')
        }
      } catch (error) {
        console.error('OAuth callback error:', error)
        router.push('/login?error=callback_error')
      }
    }

    handleAuthCallback()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isDevMode ? 'Development Mode Sign In' : 'Completing Sign In'}
        </h2>
        <p className="text-gray-600">
          {isDevMode 
            ? 'Signing you in with mock credentials...'
            : 'Please wait while we process your authentication...'
          }
        </p>
        {isDevMode && (
          <p className="text-sm text-gray-500 mt-2">
            This is a simulated authentication for development purposes.
          </p>
        )}
      </div>
    </div>
  )
}