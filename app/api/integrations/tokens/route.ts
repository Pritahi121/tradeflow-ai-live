import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

// POST - Save integration token
export async function POST(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { 
      integration_type, 
      access_token, 
      refresh_token, 
      token_expires_at, 
      scope, 
      additional_config 
    } = body

    if (!integration_type || !access_token) {
      return NextResponse.json(
        { error: 'integration_type and access_token are required' },
        { status: 400 }
      )
    }

    // Validate integration type
    const allowedTypes = ['google_sheets', 'gmail', 'slack', 'webhook']
    if (!allowedTypes.includes(integration_type)) {
      return NextResponse.json(
        { error: 'Invalid integration type' },
        { status: 400 }
      )
    }

    // Save token using Supabase function
    const { data, error } = await supabase.rpc('save_integration_token', {
      integration_type,
      access_token,
      refresh_token,
      token_expires_at,
      scope,
      additional_config: additional_config || {}
    })

    if (error) {
      console.error('Token save error:', error)
      return NextResponse.json(
        { error: 'Failed to save integration token' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)

  } catch (error) {
    console.error('Token save API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET - Get all integration tokens for user
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get tokens using Supabase function
    const { data, error } = await supabase.rpc('get_integration_tokens')

    if (error) {
      console.error('Token fetch error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch integration tokens' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      tokens: data || []
    })

  } catch (error) {
    console.error('Token fetch API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete integration token
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createSupabaseClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const integrationType = searchParams.get('type')

    if (!integrationType) {
      return NextResponse.json(
        { error: 'type parameter is required' },
        { status: 400 }
      )
    }

    // Delete token
    const { error } = await supabase
      .from('integration_tokens')
      .delete()
      .eq('user_id', user.id)
      .eq('integration_type', integrationType)

    if (error) {
      console.error('Token delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete integration token' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Integration token deleted successfully'
    })

  } catch (error) {
    console.error('Token delete API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}