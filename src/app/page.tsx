'use client'

import Link from 'next/link'
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, ArrowRight, CheckCircle, BarChart, Shield } from 'lucide-react'

export default function Home() {
  const { user, loading } = useSupabaseAuth()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4">
      <div className="relative w-24 h-24 md:w-32 md:h-32">
        <img
          src="/logo.svg"
          alt="TradeFlow AI Logo"
          className="w-full h-full object-contain"
        />
      </div>
      
      <div className="text-center max-w-2xl">
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          TradeFlow AI
        </h1>
        <p className="text-xl text-muted-foreground mb-8">
          Intelligent Purchase Order Processing System
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
            <CardTitle>Smart Processing</CardTitle>
            <CardDescription>
              AI-powered purchase order analysis and processing
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <BarChart className="h-8 w-8 text-blue-600 mb-2" />
            <CardTitle>Real-time Analytics</CardTitle>
            <CardDescription>
              Track and monitor your procurement metrics
            </CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader>
            <Shield className="h-8 w-8 text-purple-600 mb-2" />
            <CardTitle>Secure & Reliable</CardTitle>
            <CardDescription>
              Enterprise-grade security for your data
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {user ? (
          <Button asChild size="lg">
            <Link href="/dashboard">
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <>
            <Button asChild size="lg">
              <Link href="/login">
                Sign In
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">
                Create Account
              </Link>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}