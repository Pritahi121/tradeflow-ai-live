// API utilities for TradeFlow AI

export interface POUploadResponse {
  success: boolean
  upload?: {
    id: string
    file_name: string
    file_type: string
    file_size: number
    status: string
    created_at: string
  }
  webhook?: any
  error?: string
}

export interface POUpload {
  id: string
  file_name: string
  file_type: string
  file_size: number
  status: 'uploaded' | 'processing' | 'completed' | 'failed'
  processing_started_at?: string
  processing_completed_at?: string
  error_message?: string
  extracted_data?: any
  n8n_workflow_id?: string
  created_at: string
  updated_at: string
}

export interface IntegrationToken {
  integration_type: string
  access_token: string
  refresh_token?: string
  token_expires_at?: string
  scope?: string
  additional_config?: any
  is_active: boolean
  last_verified_at?: string
}

// Upload PO file to Supabase
export async function uploadPOFile(file: File): Promise<POUploadResponse> {
  const formData = new FormData()
  formData.append('file', file)

  try {
    const response = await fetch('/api/po/upload', {
      method: 'POST',
      body: formData,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Upload failed')
    }

    return data
  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}

// Get PO uploads for current user
export async function getPOUploads(): Promise<{ success: boolean; uploads: POUpload[]; error?: string }> {
  try {
    const response = await fetch('/api/po/upload')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch uploads')
    }

    return data
  } catch (error) {
    console.error('Fetch uploads error:', error)
    throw error
  }
}

// Get PO upload status
export async function getPOUploadStatus(uploadId: string): Promise<{ success: boolean; upload: POUpload; error?: string }> {
  try {
    const response = await fetch(`/api/po/status?upload_id=${uploadId}`)
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch status')
    }

    return data
  } catch (error) {
    console.error('Fetch status error:', error)
    throw error
  }
}

// Save integration token
export async function saveIntegrationToken(
  integrationType: string,
  accessToken: string,
  refreshToken?: string,
  tokenExpiresAt?: string,
  scope?: string,
  additionalConfig?: any
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch('/api/integrations/tokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        integration_type: integrationType,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: tokenExpiresAt,
        scope,
        additional_config: additionalConfig,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to save token')
    }

    return data
  } catch (error) {
    console.error('Save token error:', error)
    throw error
  }
}

// Get integration tokens
export async function getIntegrationTokens(): Promise<{ success: boolean; tokens: IntegrationToken[]; error?: string }> {
  try {
    const response = await fetch('/api/integrations/tokens')
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch tokens')
    }

    return data
  } catch (error) {
    console.error('Fetch tokens error:', error)
    throw error
  }
}

// Delete integration token
export async function deleteIntegrationToken(integrationType: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`/api/integrations/tokens?type=${integrationType}`, {
      method: 'DELETE',
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete token')
    }

    return data
  } catch (error) {
    console.error('Delete token error:', error)
    throw error
  }
}

// Initiate Google OAuth flow
export function initiateGoogleOAuth(integrationType: 'sheets' | 'gmail'): void {
  const url = `/api/integrations/google/auth?type=${integrationType}`
  window.location.href = url
}

// Poll PO upload status
export function pollPOUploadStatus(
  uploadId: string,
  onStatusUpdate: (upload: POUpload) => void,
  onComplete?: (upload: POUpload) => void,
  onError?: (error: string) => void,
  interval: number = 2000,
  maxAttempts: number = 30
): () => void {
  let attempts = 0

  const poll = async () => {
    attempts++
    
    try {
      const result = await getPOUploadStatus(uploadId)
      onStatusUpdate(result.upload)

      // Check if processing is complete or failed
      if (result.upload.status === 'completed' || result.upload.status === 'failed') {
        if (onComplete) onComplete(result.upload)
        return
      }

      // Continue polling if not complete and under max attempts
      if (attempts < maxAttempts) {
        setTimeout(poll, interval)
      } else {
        if (onError) onError('Processing timeout')
      }
    } catch (error) {
      if (onError) onError(error instanceof Error ? error.message : 'Status check failed')
    }
  }

  // Start polling
  setTimeout(poll, interval)

  // Return cleanup function
  return () => {
    // Polling will stop automatically when conditions are met
  }
}