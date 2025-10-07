'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  Zap,
  Upload,
  FileText,
  TrendingUp,
  Users,
  Settings,
  Search,
  Filter,
  MoreHorizontal,
  CheckCircle,
  Clock,
  XCircle,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useUserData } from '@/hooks/useUserData'

function DashboardContent() {
  const { user, signOut } = useAuth()
  const { userStats, recentPOs, loading } = useUserData()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Clock className="h-4 w-4 text-yellow-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
      case 'processing':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Processing</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Failed</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const stats = [
    {
      title: "Credits Remaining",
      value: loading ? "..." : `${userStats.remainingCredits}/${userStats.totalCredits}`,
      description: loading ? "Loading..." : `${userStats.usedCredits} credits used this month`,
      icon: Zap,
      color: "text-blue-600"
    },
    {
      title: "Total POs Processed",
      value: loading ? "..." : userStats.totalPOs.toString(),
      description: loading ? "Loading..." : `${userStats.totalPOs > 0 ? '+' + Math.floor(userStats.totalPOs * 0.1) : '0'} from last month`,
      icon: FileText,
      color: "text-green-600"
    },
    {
      title: "Success Rate",
      value: loading ? "..." : `${userStats.successRate}%`,
      description: loading ? "Loading..." : `${Math.floor(userStats.totalPOs * userStats.successRate / 100)}/${userStats.totalPOs} processed successfully`,
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Active Integrations",
      value: loading ? "..." : userStats.activeIntegrations.toString(),
      description: loading ? "Loading..." : userStats.activeIntegrations > 0 ? "Google Sheets, Email" : "No active integrations",
      icon: Users,
      color: "text-orange-600"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h1 className="text-xl font-semibold text-gray-900">TradeFlow AI</h1>
              </div>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <a href="/dashboard" className="text-blue-600 font-medium">Dashboard</a>
              <a href="/upload" className="text-gray-500 hover:text-gray-700">Upload PO</a>
              <a href="/integrations" className="text-gray-500 hover:text-gray-700">Integrations</a>
              <a href="/billing" className="text-gray-500 hover:text-gray-700">Billing</a>
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
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your purchase orders.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    {loading ? (
                      <Skeleton className="h-8 w-16 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    )}
                    {loading ? (
                      <Skeleton className="h-4 w-24 mt-1" />
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
                    )}
                  </div>
                  <div className={`p-3 rounded-full bg-gray-50 ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credits Usage */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Credits Usage</CardTitle>
            <CardDescription>
              {loading ? (
                <Skeleton className="h-4 w-48" />
              ) : (
                `You've used ${userStats.usedCredits} out of ${userStats.totalCredits} credits this month`
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Credits Used</span>
                {loading ? (
                  <Skeleton className="h-4 w-12" />
                ) : (
                  <span>{userStats.usedCredits}/{userStats.totalCredits}</span>
                )}
              </div>
              {loading ? (
                <Skeleton className="h-2 w-full" />
              ) : (
                <Progress 
                  value={userStats.totalCredits > 0 ? (userStats.usedCredits / userStats.totalCredits) * 100 : 0} 
                  className="h-2" 
                />
              )}
              <p className="text-xs text-gray-500">
                {loading ? (
                  <Skeleton className="h-3 w-32 inline" />
                ) : (
                  <>
                    {userStats.remainingCredits} credits remaining. 
                    <Link href="/billing" className="text-blue-600 hover:text-blue-500 ml-1">
                      Upgrade plan
                    </Link> for more credits.
                  </>
                )}
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks to get you started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild className="w-full justify-start">
                <Link href="/upload">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload New PO
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/integrations">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Integration
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full justify-start">
                <Link href="/billing">
                  <Zap className="mr-2 h-4 w-4" />
                  Buy More Credits
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Purchase Orders */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Purchase Orders</CardTitle>
                  <CardDescription>
                    Your latest PO processing activity
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                    <Input placeholder="Search POs..." className="pl-8 w-48" />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  // Loading skeletons
                  Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <div>
                          <Skeleton className="h-4 w-24 mb-1" />
                          <Skeleton className="h-3 w-32" />
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <Skeleton className="h-4 w-16 mb-1" />
                          <Skeleton className="h-3 w-12" />
                        </div>
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="h-3 w-16" />
                        <Skeleton className="h-4 w-4" />
                      </div>
                    </div>
                  ))
                ) : recentPOs.length > 0 ? (
                  // Real data
                  recentPOs.map((po, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(po.status || 'processing')}
                        <div>
                          <p className="font-medium text-gray-900">{po.po_number}</p>
                          <p className="text-sm text-gray-600">{po.vendor_name || 'Unknown Vendor'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium text-gray-900">{formatCurrency(po.total_amount)}</p>
                          <p className="text-sm text-gray-600">
                            {po.items ? (Array.isArray(po.items) ? po.items.length : Object.keys(po.items).length) : 0} items
                          </p>
                        </div>
                        {getStatusBadge(po.status || 'processing')}
                        <p className="text-sm text-gray-500">{formatDate(po.created_at)}</p>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  // Empty state
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Purchase Orders Yet</h3>
                    <p className="text-gray-600 mb-4">Upload your first PO to get started with automated processing.</p>
                    <Button asChild>
                      <Link href="/upload">
                        <Upload className="mr-2 h-4 w-4" />
                        Upload First PO
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
              {!loading && recentPOs.length > 0 && (
                <div className="mt-6 text-center">
                  <Button variant="outline">View All Purchase Orders</Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
