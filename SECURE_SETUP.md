# Secure Environment Setup Guide

## Option 1: System Environment Variables (Most Secure)

### Windows (Command Prompt):
```cmd
set SUPABASE_URL=https://your-project.supabase.co
set SUPABASE_SERVICE_KEY=your-service-key-here
cd backend
npm start
```

### Windows (PowerShell):
```powershell
$env:SUPABASE_URL="https://your-project.supabase.co"
$env:SUPABASE_SERVICE_KEY="your-service-key-here"
cd backend
npm start
```

### Bash/Git Bash:
```bash
export SUPABASE_URL="https://your-project.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-key-here"
cd backend
npm start
```

## Option 2: Local .env File (Excluded from Git)

1. Keep your .env file local only
2. Add .env to .gitignore
3. Never commit actual credentials

## Option 3: Test with Mock Data First

Your system already works perfectly with mock data! You can:
1. Test all functionality with mock data
2. Add Supabase later when ready
3. System gracefully handles both scenarios

## Current Status

Your backend is already smart enough to:
- ✅ Work without Supabase (mock data)
- ✅ Work with Supabase (real data)  
- ✅ Hybrid mode (mix of both)
- ✅ Never break or show empty charts

No rush to add Supabase right now!