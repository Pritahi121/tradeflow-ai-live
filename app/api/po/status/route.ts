import { createSupabaseClient } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

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

    const { searchParams } = new URL(request.url)
    const uploadId = searchParams.get('upload_id')

    if (!uploadId) {
      return NextResponse.json(
        { error: 'upload_id parameter is required' },
        { status: 400 }
      )
    }

    // Get PO upload status with webhook info
    const { data: upload, error } = await supabase
      .from('po_uploads')
      .select(`
        *,
        n8n_webhooks (
          id,
          status,
          response_data,
          error_message,
          sent_at,
          delivered_at
        )
      `)
      .eq('id', uploadId)
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Database query error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch upload status' },
        { status: 500 }
      )
    }

    if (!upload) {
      return NextResponse.json(
        { error: 'Upload not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      upload: upload
    })

  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}