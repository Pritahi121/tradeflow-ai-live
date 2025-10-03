// Google Sheets API integration
import { supabase } from './supabase'

export interface POData {
  id: string
  po_number: string
  vendor_name?: string
  total_amount: number
  items?: any[]
  status?: string
  created_at: string
  processed_at?: string
}

export interface SheetsCredentials {
  access_token: string
  refresh_token?: string
  provider_token?: string
}

class GoogleSheetsService {
  private baseUrl = 'https://sheets.googleapis.com/v4/spreadsheets'

  /**
   * Get user's access token from Supabase session
   */
  private async getAccessToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.provider_token && !session?.access_token) {
        console.error('No Google access token found in session')
        return null
      }

      // Try provider_token first (from OAuth), then access_token (from refresh)
      return session.provider_token || session.access_token || null
    } catch (error) {
      console.error('Error getting access token:', error)
      return null
    }
  }

  /**
   * Create a new Google Sheet for PO data
   */
  async createPOSheet(title: string = 'Purchase Orders - TradeFlow AI'): Promise<string | null> {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) {
        throw new Error('No valid access token available')
      }

      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          properties: {
            title: title
          },
          sheets: [{
            properties: {
              title: 'PO Data',
              gridProperties: {
                rowCount: 1000,
                columnCount: 10
              }
            }
          }]
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Google Sheets API error:', errorData)
        throw new Error(`Failed to create sheet: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const spreadsheetId = data.spreadsheetId

      // Add headers to the sheet
      await this.addHeaders(spreadsheetId)

      return spreadsheetId
    } catch (error) {
      console.error('Error creating Google Sheet:', error)
      return null
    }
  }

  /**
   * Add headers to the sheet
   */
  private async addHeaders(spreadsheetId: string): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) return false

      const headers = [
        'PO Number',
        'Vendor Name', 
        'Total Amount',
        'Status',
        'Items Count',
        'Created Date',
        'Processed Date',
        'Download Link',
        'Notes',
        'Last Updated'
      ]

      const response = await fetch(`${this.baseUrl}/${spreadsheetId}/values/PO Data!A1:J1`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [headers],
          majorDimension: 'ROWS'
        })
      })

      return response.ok
    } catch (error) {
      console.error('Error adding headers:', error)
      return false
    }
  }

  /**
   * Export PO data to Google Sheets
   */
  async exportPOData(spreadsheetId: string, poData: POData[]): Promise<boolean> {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) {
        throw new Error('No valid access token available')
      }

      // Prepare data rows
      const rows = poData.map(po => [
        po.po_number || '',
        po.vendor_name || '',
        po.total_amount || 0,
        po.status || 'Unknown',
        Array.isArray(po.items) ? po.items.length : 0,
        po.created_at ? new Date(po.created_at).toLocaleDateString() : '',
        po.processed_at ? new Date(po.processed_at).toLocaleDateString() : '',
        `https://tradeflow-ai-saas-nu.vercel.app/dashboard?po=${po.id}`,
        'Exported from TradeFlow AI',
        new Date().toLocaleString()
      ])

      // Clear existing data (except headers) and add new data
      const range = `PO Data!A2:J${rows.length + 1}`
      
      const response = await fetch(`${this.baseUrl}/${spreadsheetId}/values/${range}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: rows,
          majorDimension: 'ROWS'
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Google Sheets export error:', errorData)
        throw new Error(`Failed to export data: ${response.status}`)
      }

      console.log(`Successfully exported ${rows.length} PO records to Google Sheets`)
      return true
    } catch (error) {
      console.error('Error exporting to Google Sheets:', error)
      return false
    }
  }

  /**
   * Get user's Google Sheets list
   */
  async getUserSheets(): Promise<any[]> {
    try {
      const accessToken = await this.getAccessToken()
      if (!accessToken) return []

      const response = await fetch('https://www.googleapis.com/drive/v3/files?q=mimeType="application/vnd.google-apps.spreadsheet"&pageSize=10', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get sheets: ${response.status}`)
      }

      const data = await response.json()
      return data.files || []
    } catch (error) {
      console.error('Error getting user sheets:', error)
      return []
    }
  }

  /**
   * Test Google Sheets connection
   */
  async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const accessToken = await this.getAccessToken()
      console.log('🔍 Testing Google Sheets connection...')
      console.log('🔑 Access token available:', !!accessToken)
      
      if (!accessToken) {
        return {
          success: false,
          message: 'No Google access token found. Please sign in with Google again and ensure Google Sheets permission is granted.'
        }
      }

      // Test with Google Sheets API directly instead of Drive API
      console.log('🧪 Testing Google Sheets API access...')
      const response = await fetch('https://sheets.googleapis.com/v4/spreadsheets?pageSize=1', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      console.log('📊 API Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('❌ API Error Response:', errorData)
        
        if (response.status === 403) {
          return {
            success: false,
            message: 'Google Sheets API access denied. Please check: 1) Google Sheets API is enabled in Google Cloud Console, 2) OAuth consent screen includes Google Sheets scope, 3) Re-login to grant Sheets permission.'
          }
        } else if (response.status === 401) {
          return {
            success: false,
            message: 'Authentication failed. Please sign out and sign in again with Google to refresh permissions.'
          }
        }
        
        throw new Error(`API test failed: ${response.status} - ${errorData.error?.message || 'Unknown error'}`)
      }

      const data = await response.json()
      console.log('✅ Google Sheets API test successful')
      
      // Also test basic user info for display
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        }
      })

      let userEmail = 'Google user'
      if (userResponse.ok) {
        const userData = await userResponse.json()
        userEmail = userData.email || userData.name || 'Google user'
      }

      return {
        success: true,
        message: `Connected as ${userEmail}. Google Sheets API access verified.`
      }
    } catch (error) {
      console.error('❌ Google Sheets connection test failed:', error)
      return {
        success: false,
        message: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }
}

// Export singleton instance
export const googleSheetsService = new GoogleSheetsService()

// Development mode mock functions
export const mockGoogleSheets = {
  async createPOSheet(title: string): Promise<string> {
    console.log(`🚀 [DEV] Creating mock Google Sheet: ${title}`)
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API delay
    return 'mock-sheet-id-12345'
  },

  async exportPOData(spreadsheetId: string, poData: POData[]): Promise<boolean> {
    console.log(`🚀 [DEV] Mock export ${poData.length} PO records to sheet: ${spreadsheetId}`)
    await new Promise(resolve => setTimeout(resolve, 1500))
    return true
  },

  async testConnection(): Promise<{ success: boolean; message: string }> {
    console.log('🚀 [DEV] Mock Google Sheets connection test')
    await new Promise(resolve => setTimeout(resolve, 800))
    return {
      success: true,
      message: 'Connected as pritahir417@gmail.com (Mock)'
    }
  },

  async getUserSheets(): Promise<any[]> {
    console.log('🚀 [DEV] Getting mock user sheets')
    return [
      { id: 'sheet1', name: 'Purchase Orders - Q4 2024' },
      { id: 'sheet2', name: 'TradeFlow AI Export' },
      { id: 'sheet3', name: 'PO Data Backup' }
    ]
  }
}