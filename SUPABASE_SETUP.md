# Supabase Integration Guide for Blue Horizon

## Step-by-Step Setup Process

### 1. Create Supabase Project
1. Go to https://supabase.com and sign up/login
2. Click "New Project"
3. Fill in project details:
   - **Name**: blue-horizon (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your location
4. Click "Create new project" and wait for setup (2-3 minutes)

### 2. Set Up Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `backend/database/schema.sql`
3. Click "Run" to create the tables and sample data

### 3. Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy these two values:
   - **Project URL** (e.g., https://abcdefgh.supabase.co)
   - **anon public** key (long string starting with "eyJ...")

### 4. Configure Backend Environment
1. Open `backend/.env` file
2. Replace the placeholder values:
   ```env
   SUPABASE_URL=https://your-actual-project-url.supabase.co
   SUPABASE_ANON_KEY=your-actual-anon-key-here
   ```

### 5. Test the Integration
1. Restart your backend server:
   ```bash
   cd backend
   npm start
   ```
2. Look for this message: `✅ Supabase client connected successfully`
3. Test the API: `curl http://localhost:3001/api/trends/well-01?range=24h`
4. The response should NOT contain `"note":"Using mock data"`

### 6. Verify Real Data
- If successful, you'll see real data from your Supabase database
- If you see mock data, check your credentials and restart the server
- Check console logs for any connection errors

### 7. Optional: Add More Sample Data
Use the Supabase dashboard's Table Editor to add more sensor readings manually, or use the SQL Editor to insert bulk data.

## Troubleshooting

### Common Issues:
- **Wrong credentials**: Double-check URL and key from Supabase dashboard
- **Network issues**: Ensure your internet connection is stable
- **Schema errors**: Make sure the SQL schema ran without errors
- **Case sensitivity**: Environment variable names are case-sensitive

### Success Indicators:
- ✅ Backend logs: "Supabase client connected successfully"
- ✅ API responses don't contain mock data note
- ✅ Data matches what you see in Supabase table editor

## Next Steps After Integration:
1. Set up automated data ingestion from IoT sensors
2. Implement data validation and error handling
3. Add user authentication for data security
4. Set up real-time subscriptions for live updates