-- Enhanced Schema for PO Uploads and Integration Tokens
-- This extends the existing schema

-- PO Uploads table for file storage and processing
CREATE TABLE IF NOT EXISTS public.po_uploads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL, -- Supabase storage URL
  storage_path TEXT NOT NULL, -- Storage bucket path
  status TEXT DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
  processing_started_at TIMESTAMP WITH TIME ZONE,
  processing_completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  extracted_data JSONB DEFAULT '{}',
  n8n_workflow_id TEXT, -- n8n workflow execution ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Integration tokens table for OAuth tokens
CREATE TABLE IF NOT EXISTS public.integration_tokens (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  integration_type TEXT NOT NULL CHECK (integration_type IN ('google_sheets', 'gmail', 'slack', 'webhook')),
  access_token TEXT NOT NULL,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  additional_config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  last_verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, integration_type)
);

-- n8n Webhook tracking table
CREATE TABLE IF NOT EXISTS public.n8n_webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  po_upload_id UUID REFERENCES public.po_uploads(id) ON DELETE CASCADE,
  webhook_url TEXT NOT NULL,
  webhook_secret TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed')),
  response_data JSONB DEFAULT '{}',
  error_message TEXT,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Row Level Security for new tables

-- PO Uploads
ALTER TABLE public.po_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own uploads" ON public.po_uploads FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON public.po_uploads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON public.po_uploads FOR UPDATE USING (auth.uid() = user_id);

-- Integration Tokens
ALTER TABLE public.integration_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own tokens" ON public.integration_tokens FOR ALL USING (auth.uid() = user_id);

-- n8n Webhooks
ALTER TABLE public.n8n_webhooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own webhooks" ON public.n8n_webhooks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own webhooks" ON public.n8n_webhooks FOR ALL USING (auth.uid() = user_id);

-- Functions for PO Processing

-- Function to trigger n8n workflow
CREATE OR REPLACE FUNCTION public.trigger_n8n_workflow(
  po_upload_id UUID,
  webhook_url TEXT DEFAULT 'https://n8n.tradeflow.ai/webhook/po-processing'
)
RETURNS JSONB AS $$
DECLARE
  webhook_secret TEXT;
  webhook_record RECORD;
  payload JSONB;
BEGIN
  -- Generate webhook secret
  webhook_secret := encode(gen_random_bytes(32), 'hex');
  
  -- Create webhook record
  INSERT INTO public.n8n_webhooks (user_id, po_upload_id, webhook_url, webhook_secret)
  VALUES (
    auth.uid(),
    po_upload_id,
    webhook_url,
    webhook_secret
  )
  RETURNING * INTO webhook_record;
  
  -- Prepare payload for n8n
  SELECT jsonb_build_object(
    'webhook_id', webhook_record.id,
    'webhook_secret', webhook_secret,
    'po_upload', to_jsonb(po)
  ) INTO payload
  FROM public.po_uploads po
  WHERE po.id = po_upload_id;
  
  -- Update PO status to processing
  UPDATE public.po_uploads 
  SET status = 'processing',
      processing_started_at = NOW(),
      n8n_workflow_id = webhook_record.id::text
  WHERE id = po_upload_id;
  
  -- Return webhook info for frontend
  RETURN jsonb_build_object(
    'success', true,
    'webhook_id', webhook_record.id,
    'webhook_url', webhook_url,
    'webhook_secret', webhook_secret,
    'payload', payload
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to save integration tokens
CREATE OR REPLACE FUNCTION public.save_integration_token(
  integration_type TEXT,
  access_token TEXT,
  refresh_token TEXT DEFAULT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  scope TEXT DEFAULT NULL,
  additional_config JSONB DEFAULT '{}'
)
RETURNS JSONB AS $$
BEGIN
  INSERT INTO public.integration_tokens (
    user_id, integration_type, access_token, refresh_token, 
    token_expires_at, scope, additional_config, last_verified_at
  ) VALUES (
    auth.uid(), integration_type, access_token, refresh_token,
    token_expires_at, scope, additional_config, NOW()
  )
  ON CONFLICT (user_id, integration_type) 
  DO UPDATE SET
    access_token = EXCLUDED.access_token,
    refresh_token = EXCLUDED.refresh_token,
    token_expires_at = EXCLUDED.token_expires_at,
    scope = EXCLUDED.scope,
    additional_config = EXCLUDED.additional_config,
    last_verified_at = NOW(),
    updated_at = NOW();
  
  RETURN jsonb_build_object('success', true, 'message', 'Token saved successfully');
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get active integration tokens
CREATE OR REPLACE FUNCTION public.get_integration_tokens()
RETURNS TABLE (
  integration_type TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  scope TEXT,
  additional_config JSONB,
  is_active BOOLEAN,
  last_verified_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    it.integration_type,
    it.access_token,
    it.refresh_token,
    it.token_expires_at,
    it.scope,
    it.additional_config,
    it.is_active,
    it.last_verified_at
  FROM public.integration_tokens it
  WHERE it.user_id = auth.uid() AND it.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_po_uploads_user_id ON public.po_uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_po_uploads_status ON public.po_uploads(status);
CREATE INDEX IF NOT EXISTS idx_po_uploads_created_at ON public.po_uploads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_user_id ON public.integration_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_integration_tokens_type ON public.integration_tokens(integration_type);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_user_id ON public.n8n_webhooks(user_id);
CREATE INDEX IF NOT EXISTS idx_n8n_webhooks_status ON public.n8n_webhooks(status);

-- Storage bucket for PO files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'po-uploads',
  'po-uploads',
  false, -- Private bucket
  10485760, -- 10MB limit
  ARRAY['application/pdf', 'message/rfc822', 'text/plain']
) ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Users can upload own PO files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'po-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view own PO files" ON storage.objects
FOR SELECT USING (
  bucket_id = 'po-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update own PO files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'po-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete own PO files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'po-uploads' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);