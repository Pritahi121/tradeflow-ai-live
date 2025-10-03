import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
const isDev = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// Create Supabase client - in dev mode, this may not connect to a real instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Development mode check
export const isDevMode = isDev && (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder'))

// Database Types matching your existing schema
export interface Client {
  id: string
  client_id: string
  user_id: string
  name?: string
  company?: string
  email?: string
  phone?: string
  created_at: string
  updated_at: string
}

export interface UserQuota {
  id: string
  user_id: string
  monthly_quota: number
  remaining_credits: number
  monthly_credits: number
  created_at: string
  updated_at: string
}

export interface PurchaseOrder {
  id: string
  user_id: string
  po_number: string
  vendor_name?: string
  total_amount: number
  items?: any // jsonb
  status?: string
  created_at: string
  updated_at: string
}

export interface PaymentHistory {
  id: string
  user_id: string
  payment_amount: number
  stripe_payment_id?: string
  status: string
  created_at: string
}

export interface UsageLog {
  id: string
  user_id: string
  action_type: string
  credits_used: number
  timestamp: string
}

export interface PricingConfig {
  id: number
  plan_name: string
  price_amount: number
  credits_included: number
  is_active: boolean
}
