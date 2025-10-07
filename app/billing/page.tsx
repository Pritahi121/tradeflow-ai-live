'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Zap,
  Settings,
  CreditCard,
  Download,
  CheckCircle,
  ArrowLeft,
  Star,
  Users,
  Building
} from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'

function BillingContent() {
  const { user, signOut } = useAuth()

  const plans = [
    {
      name: "Starter",
      price: "₹299",
      period: "/month",
      credits: 10,
      description: "Perfect for small businesses getting started",
      features: [
        "10 PO processing credits per month",
        "Email notifications",
        "Google Sheets export",
        "Basic support",
        "Data retention: 6 months"
      ],
      popular: false,
      current: true
    },
    {
      name: "Professional",
      price: "₹999",
      period: "/month",
      credits: 100,
      description: "Ideal for growing businesses with regular PO volume",
      features: [
        "100 PO processing credits per month",
        "Priority email notifications",
        "Google Sheets export",
        "Priority support",
        "Data retention: 2 years",
        "Advanced analytics"
      ],
      popular: true,
      current: false
    },
    {
      name: "Business",
      price: "₹2,499",
      period: "/month",
      credits: 500,
      description: "For established businesses with high PO volume",
      features: [
        "500 PO processing credits per month",
        "Real-time notifications",
        "Multiple export formats",
        "Phone & email support",
        "Data retention: 5 years",
        "Advanced analytics",
        "Custom reporting"
      ],
      popular: false,
      current: false
    }
  ]

  const paymentHistory = [
    {
      id: "inv_001",
      date: "2024-01-15",
      amount: "₹299",
      status: "paid",
      plan: "Starter Plan",
      period: "Jan 2024"
    },
    {
      id: "inv_002",
      date: "2023-12-15",
      amount: "₹299",
      status: "paid",
      plan: "Starter Plan",
      period: "Dec 2023"
    },
    {
      id: "inv_003",
      date: "2023-11-15",
      amount: "₹299",
      status: "paid",
      plan: "Starter Plan",
      period: "Nov 2023"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" asChild className="mr-4">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div className="ml-4">
                  <h1 className="text-xl font-semibold text-gray-900">TradeFlow AI</h1>
                </div>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/dashboard" className="text-gray-500 hover:text-gray-700">Dashboard</a>
              <a href="/upload" className="text-gray-500 hover:text-gray-700">Upload PO</a>
              <a href="/integrations" className="text-gray-500 hover:text-gray-700">Integrations</a>
              <a href="/billing" className="text-blue-600 font-medium">Billing</a>
              <a href="/settings" className="text-gray-500 hover:text-gray-700">Settings</a>
            </nav>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                Welcome, {user?.user_metadata?.name || user?.email}
              </span>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/settings">
                  <Settings className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
          <p className="mt-2 text-gray-600">
            Manage your subscription, view usage, and billing history.
          </p>
        </div>

        {/* Current Plan & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                Your active subscription and usage details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Starter Plan</h3>
                  <p className="text-gray-600">₹299/month • 10 credits included</p>
                </div>
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                  Active
                </Badge>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Credits Used This Month</span>
                    <span>2/10</span>
                  </div>
                  <Progress value={20} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">8 credits remaining</p>
                </div>
                
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Next billing date</p>
                      <p className="text-sm text-gray-600">February 15, 2024</p>
                    </div>
                    <Button variant="outline">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Update Payment
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button className="w-full">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade Plan
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Download Invoice
              </Button>
              <Button variant="outline" className="w-full">
                <CreditCard className="h-4 w-4 mr-2" />
                Payment Methods
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Available Plans */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Available Plans</CardTitle>
            <CardDescription>
              Choose the plan that best fits your business needs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`relative p-6 border rounded-lg ${
                    plan.popular ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                  } ${plan.current ? 'ring-2 ring-green-500' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-blue-600 text-white">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {plan.current && (
                    <div className="absolute -top-3 right-4">
                      <Badge className="bg-green-600 text-white">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Current Plan
                      </Badge>
                    </div>
                  )}

                  <div className="text-center mb-6">
                    <div className="flex items-center justify-center mb-2">
                      {plan.name === 'Starter' && <Users className="h-6 w-6 text-blue-600" />}
                      {plan.name === 'Professional' && <Building className="h-6 w-6 text-purple-600" />}
                      {plan.name === 'Business' && <Star className="h-6 w-6 text-orange-600" />}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{plan.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-3xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-600 ml-1">{plan.period}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{plan.credits} credits included</p>
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className="w-full" 
                    variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                    disabled={plan.current}
                  >
                    {plan.current ? 'Current Plan' : `Upgrade to ${plan.name}`}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card>
          <CardHeader>
            <CardTitle>Payment History</CardTitle>
            <CardDescription>
              View your past invoices and payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentHistory.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{payment.plan}</p>
                      <p className="text-sm text-gray-600">{payment.period}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{payment.amount}</p>
                      <p className="text-sm text-gray-600">{payment.date}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                      Paid
                    </Badge>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Button variant="outline">View All Invoices</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function BillingPage() {
  return (
    <ProtectedRoute>
      <BillingContent />
    </ProtectedRoute>
  )
}
