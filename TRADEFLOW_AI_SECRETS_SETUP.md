# 🔐 TradeFlow AI - Supabase Edge Functions Secrets

## 🎯 Required Secrets for TradeFlow AI Production

### 📋 Copy-Paste Ready Commands:

```bash
# Navigate to your Supabase project directory first
cd /path/to/your/supabase/project

# Set all TradeFlow AI secrets at once
supabase secrets set \
  OPENAI_API_KEY="sk-your_openai_api_key_here" \
  GOOGLE_SHEETS_API_KEY="your_google_sheets_api_key" \
  GOOGLE_SERVICE_ACCOUNT_EMAIL="tradeflow-ai@your-project.iam.gserviceaccount.com" \
  GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----" \
  RESEND_API_KEY="re_your_resend_api_key_here" \
  SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_from_supabase_dashboard" \
  SUPABASE_URL="https://isnfyeoabzaopqqmmgqz.supabase.co" \
  WEBHOOK_SECRET="your_secure_webhook_secret_key" \
  JWT_SECRET="your_jwt_secret_for_token_validation" \
  STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key" \
  STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
```

## 🔑 Individual Secret Commands:

### 1. OpenAI API Key (for PO Processing AI)
```bash
supabase secrets set OPENAI_API_KEY="sk-your_openai_api_key_here"
```

### 2. Google Sheets Integration
```bash
supabase secrets set GOOGLE_SHEETS_API_KEY="your_google_sheets_api_key"
supabase secrets set GOOGLE_SERVICE_ACCOUNT_EMAIL="tradeflow-ai@your-project.iam.gserviceaccount.com"
supabase secrets set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### 3. Email Service (Resend)
```bash
supabase secrets set RESEND_API_KEY="re_your_resend_api_key_here"
```

### 4. Supabase Configuration
```bash
supabase secrets set SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_from_dashboard"
supabase secrets set SUPABASE_URL="https://isnfyeoabzaopqqmmgqz.supabase.co"
```

### 5. Security & Webhooks
```bash
supabase secrets set WEBHOOK_SECRET="your_secure_webhook_secret_key"
supabase secrets set JWT_SECRET="your_jwt_secret_for_token_validation"
```

### 6. Payment Processing (Stripe)
```bash
supabase secrets set STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
supabase secrets set STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
```

## 📍 Where to Get These Keys:

### 🤖 OpenAI API Key
1. Visit: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy key (starts with `sk-`)

### 📊 Google Sheets API Setup
1. Go to: https://console.cloud.google.com/
2. Enable Google Sheets API
3. Create Service Account
4. Download JSON credentials
5. Extract `client_email` and `private_key`

### 📧 Resend API Key
1. Visit: https://resend.com/api-keys
2. Create new API key
3. Copy key (starts with `re_`)

### 🔑 Supabase Service Role Key
1. Go to your Supabase project dashboard
2. Settings → API
3. Copy `service_role` key (NOT anon key)

### 💳 Stripe Keys
1. Visit: https://dashboard.stripe.com/apikeys
2. Copy Secret key (starts with `sk_live_` or `sk_test_`)
3. For webhook secret: Webhooks → Add endpoint → Copy signing secret

## ✅ Verify Secrets are Set

```bash
# List all secrets (values will be hidden for security)
supabase secrets list
```

## 🚀 Deploy Edge Functions After Setting Secrets

```bash
# Deploy all functions
supabase functions deploy

# Or deploy specific functions
supabase functions deploy process-purchase-order
supabase functions deploy send-email-notification
supabase functions deploy export-to-google-sheets
supabase functions deploy handle-stripe-webhook
```

## 🛡️ Security Best Practices

1. **Never commit secrets to Git**
2. **Use different keys for development/production**
3. **Rotate keys every 90 days**
4. **Monitor secret usage in logs**
5. **Use least privilege principle**

## 🔒 Vault Security Fix (IMPORTANT!)

Your `vault.secrets` table currently has RLS disabled. Fix this:

```sql
-- Enable RLS on vault.secrets
ALTER TABLE vault.secrets ENABLE ROW LEVEL SECURITY;

-- Only allow service_role to access secrets
CREATE POLICY "Service role can manage secrets" ON vault.secrets
  FOR ALL USING (auth.role() = 'service_role');
```

## 📝 Environment Variables for Local Development

Create `.env.local` for local testing:

```env
# .env.local (for local development only - DO NOT COMMIT)
OPENAI_API_KEY=sk-your_openai_key_here
GOOGLE_SHEETS_API_KEY=your_google_api_key
GOOGLE_SERVICE_ACCOUNT_EMAIL=tradeflow-ai@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
RESEND_API_KEY=re_your_resend_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_URL=https://isnfyeoabzaopqqmmgqz.supabase.co
WEBHOOK_SECRET=your_webhook_secret
JWT_SECRET=your_jwt_secret
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## 🎯 TradeFlow AI Specific Functions

These secrets will be used by your Edge Functions:

1. **`process-purchase-order`** - Uses OpenAI API
2. **`send-email-notification`** - Uses Resend API
3. **`export-to-google-sheets`** - Uses Google Sheets API
4. **`handle-stripe-webhook`** - Uses Stripe webhook secret
5. **`user-quota-management`** - Uses Supabase service role

---

**🔐 Keep your secrets secure and never share them publicly!**

**📞 Need help? Check your database analysis files for more security recommendations.**
