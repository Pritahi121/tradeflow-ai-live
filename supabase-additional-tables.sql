-- Create user_integrations table for tracking active integrations
CREATE TABLE IF NOT EXISTS public.user_integrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    integration_type VARCHAR(50) NOT NULL, -- 'google_sheets', 'whatsapp', 'email', 'webhook'
    integration_name VARCHAR(100) NOT NULL,
    config JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_integrations ENABLE ROW LEVEL SECURITY;

-- Create policies for user_integrations
CREATE POLICY "Users can view their own integrations" ON public.user_integrations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own integrations" ON public.user_integrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own integrations" ON public.user_integrations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own integrations" ON public.user_integrations
    FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON public.user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_active ON public.user_integrations(user_id, is_active);

-- Insert some sample integrations for the test user
-- Note: This will only work if the test user exists
INSERT INTO public.user_integrations (user_id, integration_type, integration_name, config, is_active)
SELECT 
    id,
    'google_sheets',
    'Google Sheets Export',
    '{"sheet_id": "sample_sheet_123", "worksheet": "PO_Data"}',
    true
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

INSERT INTO public.user_integrations (user_id, integration_type, integration_name, config, is_active)
SELECT 
    id,
    'email',
    'Email Notifications',
    '{"notification_email": "test@tradeflow.ai", "send_on_completion": true}',
    true
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

-- Create a function to automatically create user quota when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_quotas (user_id, monthly_quota, remaining_credits, monthly_credits)
    VALUES (NEW.id, 10, 10, 10);
    
    INSERT INTO public.clients (user_id, client_id)
    VALUES (NEW.id, 'CLIENT_' || UPPER(SUBSTRING(NEW.id::text, 1, 8)));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create user data on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update existing test user's quota if needed
INSERT INTO public.user_quotas (user_id, monthly_quota, remaining_credits, monthly_credits)
SELECT 
    id,
    10,
    8, -- 2 credits used as shown in dashboard
    10
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT (user_id) DO UPDATE SET
    remaining_credits = 8,
    monthly_quota = 10,
    monthly_credits = 10;

-- Insert some sample purchase orders for the test user
INSERT INTO public.purchase_orders (user_id, po_number, vendor_name, total_amount, items, status, created_at)
SELECT 
    id,
    'PO-2024-001',
    'Tech Solutions Ltd',
    45000,
    '[{"item": "Laptops", "quantity": 5, "price": 9000}]'::jsonb,
    'completed',
    NOW() - INTERVAL '1 day'
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

INSERT INTO public.purchase_orders (user_id, po_number, vendor_name, total_amount, items, status, created_at)
SELECT 
    id,
    'PO-2024-002',
    'Office Supplies Co',
    15000,
    '[{"item": "Chairs", "quantity": 12, "price": 1250}]'::jsonb,
    'processing',
    NOW() - INTERVAL '2 days'
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

INSERT INTO public.purchase_orders (user_id, po_number, vendor_name, total_amount, items, status, created_at)
SELECT 
    id,
    'PO-2024-003',
    'Manufacturing Inc',
    85000,
    '[{"item": "Machinery", "quantity": 3, "price": 28333}]'::jsonb,
    'completed',
    NOW() - INTERVAL '3 days'
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

INSERT INTO public.purchase_orders (user_id, po_number, vendor_name, total_amount, items, status, created_at)
SELECT 
    id,
    'PO-2024-004',
    'Digital Services',
    25000,
    '[{"item": "Software License", "quantity": 8, "price": 3125}]'::jsonb,
    'failed',
    NOW() - INTERVAL '4 days'
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

-- Insert usage logs
INSERT INTO public.usage_logs (user_id, action_type, credits_used, timestamp)
SELECT 
    id,
    'po_processing',
    1,
    NOW() - INTERVAL '1 day'
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;

INSERT INTO public.usage_logs (user_id, action_type, credits_used, timestamp)
SELECT 
    id,
    'po_processing',
    1,
    NOW() - INTERVAL '2 days'
FROM auth.users 
WHERE email = 'test@tradeflow.ai'
ON CONFLICT DO NOTHING;
