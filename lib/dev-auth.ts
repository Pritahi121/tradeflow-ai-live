// Development authentication utilities
import { User, Session } from '@supabase/supabase-js'

// Mock user for development
export const mockUser: User = {
  id: 'dev-user-123',
  aud: 'authenticated',
  role: 'authenticated',
  email: 'test@tradeflow.ai',
  email_confirmed_at: new Date().toISOString(),
  phone: '',
  confirmed_at: new Date().toISOString(),
  last_sign_in_at: new Date().toISOString(),
  app_metadata: {},
  user_metadata: {
    name: 'Development User',
    company: 'TradeFlow AI'
  },
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
}

// Mock session for development
export const mockSession: Session = {
  access_token: 'dev-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  refresh_token: 'dev-refresh-token',
  user: mockUser
}

// Mock data for development dashboard
export const mockDashboardData = {
  credits: {
    total: 10,
    used: 2,
    remaining: 8
  },
  purchaseOrders: {
    total: 24,
    processed: 23,
    success_rate: 96
  },
  integrations: {
    active: 2,
    total: 4,
    types: ['Google Sheets', 'Email Notifications']
  },
  recentActivity: [
    {
      id: '1',
      type: 'po_processed',
      description: 'PO #12345 from ABC Corp processed successfully',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '2',
      type: 'credit_used',
      description: '1 credit used for PO processing',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
      id: '3',
      type: 'integration_connected',
      description: 'Google Sheets integration activated',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
    }
  ]
}

// Development auth functions
export const devAuth = {
  signIn: async (email: string, password: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Simple validation for demo
    if (password.length < 6) {
      return { 
        data: { user: null, session: null }, 
        error: { message: 'Password must be at least 6 characters long' } 
      }
    }
    
    return { 
      data: { user: mockUser, session: mockSession }, 
      error: null 
    }
  },

  signUp: async (email: string, password: string, metadata?: any) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const userWithMetadata = {
      ...mockUser,
      email,
      user_metadata: {
        ...mockUser.user_metadata,
        ...metadata
      }
    }
    
    return { 
      data: { 
        user: userWithMetadata, 
        session: { ...mockSession, user: userWithMetadata } 
      }, 
      error: null 
    }
  },

  signOut: async () => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return { error: null }
  },

  getSession: async () => {
    return { data: { session: mockSession }, error: null }
  }
}