'use client'

import { useState, useEffect } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface SupabaseErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function SupabaseErrorBoundary({ children, fallback }: SupabaseErrorBoundaryProps) {
  const [hasError, setHasError] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.error?.message?.includes('Supabase') || 
          event.error?.message?.includes('fetch') ||
          event.error?.message?.includes('network')) {
        console.log('🛡️ SupabaseErrorBoundary: Caught Supabase error')
        setHasError(true)
        setError(event.error)
        event.preventDefault()
      }
    }

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      if (event.reason?.message?.includes('Supabase') || 
          event.reason?.message?.includes('fetch') ||
          event.reason?.message?.includes('network')) {
        console.log('🛡️ SupabaseErrorBoundary: Caught Supabase promise rejection')
        setHasError(true)
        setError(new Error(event.reason?.message || 'Supabase connection error'))
        event.preventDefault()
      }
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const handleRetry = () => {
    setHasError(false)
    setError(null)
    window.location.reload()
  }

  if (hasError) {
    if (fallback) {
      return fallback
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Development Mode Active
            </h2>
            <p className="text-gray-600">
              Using mock authentication for development
            </p>
          </div>

          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Supabase Connection Failed</strong>
              <br />
              The app is running in development mode with mock data.
              <br />
              <span className="text-sm text-gray-600">
                Error: {error?.message || 'Unable to connect to Supabase'}
              </span>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <Button onClick={handleRetry} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Connection
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                This is normal in development mode. 
                <br />
                You can continue using the app with mock data.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}