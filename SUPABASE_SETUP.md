# 🚀 TradeFlow AI - Supabase Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login to your account
3. Click "New Project"
4. Choose your organization
5. Fill project details:
   - **Name**: `tradeflow-ai`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
6. Click "Create new project"

## Step 2: Get Project Credentials

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)
   - **service_role key** (starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`)

## Step 3: Update Environment Variables

Update your `.env.local` file with your Supabase credentials:

```bash
# Replace with your actual Supabase values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 4: Setup Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New Query"
3. Copy and paste the entire content from `supabase-schema.sql`
4. Click "Run" to execute the schema

This will create:
- ✅ User profiles table
- ✅ Credits management system
- ✅ Purchase orders table
- ✅ Integrations table
- ✅ API keys table
- ✅ Credit transactions table
- ✅ Row Level Security policies
- ✅ Automatic triggers for user signup and credit management

## Step 5: Configure Authentication

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider (should be enabled by default)
3. Optional: Enable **Google** and **Twitter** providers:
   - For Google: Add your Google OAuth credentials
   - For Twitter: Add your Twitter OAuth credentials

## Step 6: Test the Setup

1. Restart your development server:
   ```bash
   bun run dev
   ```

2. Go to [http://localhost:3000](http://localhost:3000)
3. Click "Start Free Trial" → "Sign up for free"
4. Create a test account
5. You should be redirected to the dashboard

## Step 7: Verify Database

1. Go to **Table Editor** in Supabase
2. Check that these tables exist:
   - `user_profiles`
   - `user_credits`
   - `purchase_orders`
   - `user_integrations`
   - `api_keys`
   - `credit_transactions`

3. After creating a test user, verify:
   - User profile is created in `user_profiles`
   - User gets 10 credits in `user_credits`

## 🎉 You're All Set!

Your TradeFlow AI application is now connected to Supabase with:

- ✅ **Authentication**: Users can sign up/login
- ✅ **Database**: All tables and relationships
- ✅ **Security**: Row Level Security enabled
- ✅ **Credits System**: Automatic credit management
- ✅ **Real-time**: Supabase real-time features available

## Troubleshooting

### Network Error on Login
- Check if your `.env.local` file has correct Supabase URL and keys
- Restart your development server after updating environment variables

### Database Connection Issues
- Verify your Supabase project is active
- Check if the SQL schema was executed successfully
- Ensure Row Level Security policies are in place

### Authentication Not Working
- Confirm email provider is enabled in Supabase Auth settings
- Check browser console for any JavaScript errors

## Next Steps

1. **Deploy to Production**: Update environment variables in your hosting platform
2. **Add File Storage**: Use Supabase Storage for PO file uploads
3. **Real-time Features**: Implement real-time PO status updates
4. **Email Templates**: Customize Supabase Auth email templates
5. **Analytics**: Add usage analytics and reporting

## Support

If you need help:
1. Check Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
2. Join Supabase Discord: [https://discord.supabase.com](https://discord.supabase.com)
3. Review the application logs in browser console

---

**Happy coding! 🚀**
