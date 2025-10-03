'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Zap,
  Settings,
  Mail,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { useState, useEffect } from 'react'
import { googleSheetsService, mockGoogleSheets } from '@/lib/google-sheets'
import { isDevMode } from '@/lib/supabase'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

function IntegrationsContent() {
  const { user, signOut } = useAuth()
  const [emailEnabled, setEmailEnabled] = useState(true)
  const [sheetsEnabled, setSheetsEnabled] = useState(false)
  const [notificationEmail, setNotificationEmail] = useState(user?.email || '')
  const [sheetsConfiguring, setSheetsConfiguring] = useState(false)
  const [sheetsConnected, setSheetsConnected] = useState(false)
  const [sheetsConnectionMessage, setSheetsConnectionMessage] = useState('')
  const [sheetsAlert, setSheetsAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null)

  const integrations = [
    {
      id: 'email',
      name: 'Email Notifications',
      description: 'Get notified when your POs are processed',
      icon: Mail,
      enabled: emailEnabled,
      status: 'active',
      category: 'notifications',
      setup: true
    },
    {
      id: 'sheets',
      name: 'Google Sheets',
      description: 'Export processed PO data directly to spreadsheets',
      icon: FileSpreadsheet,
      enabled: sheetsEnabled,
      status: 'available',
      category: 'export',
      setup: false
    }
  ]

  const handleToggle = (id: string, enabled: boolean) => {
    if (id === 'email') {
      setEmailEnabled(enabled)
    } else if (id === 'sheets') {
      setSheetsEnabled(enabled)
    }
  }

  // Test Google Sheets connection on component mount
  useEffect(() => {
    const testSheetsConnection = async () => {
      if (isDevMode) {
        // Mock connection test in development
        const result = await mockGoogleSheets.testConnection()
        setSheetsConnected(result.success)
        setSheetsConnectionMessage(result.message)
      } else {
        // Real Google Sheets connection test
        const result = await googleSheetsService.testConnection()
        setSheetsConnected(result.success)
        setSheetsConnectionMessage(result.message)
      }
    }

    testSheetsConnection()
  }, [])

  const handleConfigureGoogleSheets = async () => {
    setSheetsConfiguring(true)
    setSheetsAlert(null)
    
    try {
      // Test connection first
      let connectionResult
      if (isDevMode) {
        connectionResult = await mockGoogleSheets.testConnection()
      } else {
        connectionResult = await googleSheetsService.testConnection()
      }

      if (!connectionResult.success) {
        setSheetsAlert({
          type: 'error',
          message: connectionResult.message
        })
        return
      }

      // Try to create a test sheet or get user sheets
      let sheetsResult
      if (isDevMode) {
        sheetsResult = await mockGoogleSheets.createPOSheet('TradeFlow AI - PO Export')
        if (sheetsResult) {
          setSheetsAlert({
            type: 'success',
            message: `Successfully configured! Mock sheet created with ID: ${sheetsResult}`
          })
          setSheetsEnabled(true)
        }
      } else {
        // In production, try to get user sheets to verify API access
        const userSheets = await googleSheetsService.getUserSheets()
        if (userSheets) {
          setSheetsAlert({
            type: 'success',
            message: `Google Sheets connected successfully! Found ${userSheets.length} sheets in your account.`
          })
          setSheetsEnabled(true)
        } else {
          throw new Error('Failed to access Google Sheets API')
        }
      }

      setSheetsConnected(true)
      
    } catch (error) {
      console.error('Google Sheets configuration error:', error)
      setSheetsAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to configure Google Sheets'
      })
    } finally {
      setSheetsConfiguring(false)
    }
  }

  const handleTestGoogleSheetsExport = async () => {
    setSheetsConfiguring(true)
    setSheetsAlert(null)
    
    try {
      // Mock PO data for testing
      const mockPOData = [
        {
          id: '1',
          po_number: 'PO-2024-001',
          vendor_name: 'Test Vendor',
          total_amount: 1250.50,
          items: [{ name: 'Test Item', quantity: 5 }],
          status: 'Completed',
          created_at: new Date().toISOString(),
          processed_at: new Date().toISOString()
        }
      ]

      if (isDevMode) {
        const success = await mockGoogleSheets.exportPOData('mock-sheet-id', mockPOData)
        if (success) {
          setSheetsAlert({
            type: 'success',
            message: 'Test export successful! Mock data exported to Google Sheets.'
          })
        }
      } else {
        // Create a test sheet and export data
        const sheetId = await googleSheetsService.createPOSheet('TradeFlow AI - Test Export')
        if (sheetId) {
          const success = await googleSheetsService.exportPOData(sheetId, mockPOData)
          if (success) {
            setSheetsAlert({
              type: 'success',
              message: `Test export successful! Created sheet and exported test data. Sheet ID: ${sheetId}`
            })
          } else {
            throw new Error('Export test failed')
          }
        } else {
          throw new Error('Failed to create test sheet')
        }
      }
      
    } catch (error) {
      console.error('Google Sheets export test error:', error)
      setSheetsAlert({
        type: 'error',
        message: error instanceof Error ? error.message : 'Export test failed'
      })
    } finally {
      setSheetsConfiguring(false)
    }
  }

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
              <a href="/integrations" className="text-blue-600 font-medium">Integrations</a>
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
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
          <p className="mt-2 text-gray-600">
            Connect TradeFlow AI with your favorite tools to streamline your workflow.
          </p>
        </div>

        {/* Active Integrations Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Integration Status</CardTitle>
            <CardDescription>
              Overview of your connected services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">
                    {integrations.filter(i => i.enabled).length} Active
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {integrations.filter(i => !i.enabled).length} Available
                  </span>
                </div>
              </div>
              <Badge variant="outline" className="text-green-600 border-green-200">
                All Systems Operational
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Available Integrations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {integrations.map((integration) => (
            <Card key={integration.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <integration.icon className="h-6 w-6 text-gray-700" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                      <CardDescription>{integration.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={integration.enabled}
                    onCheckedChange={(checked) => handleToggle(integration.id, checked)}
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <Badge 
                      variant={integration.enabled ? "default" : "secondary"}
                      className={integration.enabled ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {integration.enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  
                  {integration.enabled && integration.setup && (
                    <div className="pt-4 border-t">
                      {integration.id === 'email' && (
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="notification-email" className="text-sm font-medium">
                              Notification Email
                            </Label>
                            <Input
                              id="notification-email"
                              type="email"
                              value={notificationEmail}
                              onChange={(e) => setNotificationEmail(e.target.value)}
                              placeholder="Enter email address"
                              className="mt-1"
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="notify-completion"
                              defaultChecked
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="notify-completion" className="text-sm">
                              Notify on PO completion
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="notify-errors"
                              defaultChecked
                              className="rounded border-gray-300"
                            />
                            <Label htmlFor="notify-errors" className="text-sm">
                              Notify on processing errors
                            </Label>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {integration.enabled && !integration.setup && integration.id === 'sheets' && (
                    <div className="pt-4 border-t space-y-4">
                      {/* Connection Status */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          {sheetsConnected ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <AlertCircle className="h-4 w-4 text-yellow-600" />
                          )}
                          <span className="text-sm font-medium">
                            {sheetsConnected ? 'Connected' : 'Not Connected'}
                          </span>
                        </div>
                        <Badge variant={sheetsConnected ? 'default' : 'secondary'}>
                          {sheetsConnected ? 'Ready' : 'Setup Required'}
                        </Badge>
                      </div>

                      {sheetsConnectionMessage && (
                        <p className="text-xs text-gray-600 px-3">
                          {sheetsConnectionMessage}
                        </p>
                      )}

                      {/* Alerts */}
                      {sheetsAlert && (
                        <Alert className={sheetsAlert.type === 'success' ? 'border-green-200' : 'border-red-200'}>
                          {sheetsAlert.type === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          <AlertDescription className={sheetsAlert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                            {sheetsAlert.message}
                          </AlertDescription>
                        </Alert>
                      )}

                      {/* Action Buttons */}
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={handleConfigureGoogleSheets}
                          disabled={sheetsConfiguring}
                        >
                          {sheetsConfiguring ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Configuring...
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Configure Google Sheets
                            </>
                          )}
                        </Button>

                        {sheetsConnected && (
                          <Button 
                            className="w-full" 
                            variant="secondary" 
                            size="sm"
                            onClick={handleTestGoogleSheetsExport}
                            disabled={sheetsConfiguring}
                          >
                            {sheetsConfiguring ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Testing...
                              </>
                            ) : (
                              <>
                                <FileSpreadsheet className="h-4 w-4 mr-2" />
                                Test Export
                              </>
                            )}
                          </Button>
                        )}

                        {/* Re-login Button for 403 Errors */}
                        {!sheetsConnected && (
                          <Button 
                            className="w-full" 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              // Force logout and redirect to login
                              signOut()
                              setTimeout(() => {
                                window.location.href = '/login'
                              }, 100)
                            }}
                          >
                            Sign Out & Re-login with Google Sheets Permission
                          </Button>
                        )}
                      </div>
                      
                      {/* Instructions */}
                      <div className="text-xs text-gray-500 space-y-1">
                        <p>• Configure to connect Google Sheets with your account</p>
                        <p>• Test Export creates a sample sheet with mock PO data</p>
                        <p>• Requires Google Sheets API access permissions</p>
                        {!sheetsConnected && (
                          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                            <p className="font-medium text-yellow-800">Troubleshooting 403 Error:</p>
                            <p className="text-yellow-700">1. Sign out and sign in again with Google</p>
                            <p className="text-yellow-700">2. Ensure you grant Google Sheets permission during login</p>
                            <p className="text-yellow-700">3. Check browser console for detailed error logs</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle>Need Help?</CardTitle>
            <CardDescription>
              Get assistance with setting up your integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📧 Email Notifications</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Automatically receive updates when your purchase orders are processed.
                </p>
                <Button variant="outline" size="sm">
                  Learn More
                </Button>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2">📊 Google Sheets Export</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Export your processed PO data directly to Google Sheets for analysis.
                </p>
                <Button variant="outline" size="sm">
                  Setup Guide
                </Button>
              </div>
            </div>
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900">More Integrations Coming Soon</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    We're working on additional integrations based on user feedback. 
                    Contact us if you have specific integration requests.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function IntegrationsPage() {
  return (
    <ProtectedRoute>
      <IntegrationsContent />
    </ProtectedRoute>
  )
}
