# Department API Fix Guide

## 🚨 Current Issue
The Departments page shows "API Connection Issue" because the `/api/department-counts` endpoint is returning HTML instead of JSON.

## 🔍 Root Cause Analysis
1. **API Function Not Executing**: The department-counts API function is not being called properly
2. **Database Connection Issues**: The database might not be accessible or migrated
3. **Vercel Deployment Issues**: The API functions might not be deployed correctly

## 🛠️ Immediate Solutions

### Solution 1: Use the Simplified API (Quick Fix)
I've created a simplified version that doesn't require database access:

**File**: `api/department-counts-simple.ts`
- This API returns hardcoded LISH AI LABS department data
- No database connection required
- Should work immediately

**To use this:**
1. Rename `api/department-counts.ts` to `api/department-counts-backup.ts`
2. Rename `api/department-counts-simple.ts` to `api/department-counts.ts`
3. Redeploy to Vercel

### Solution 2: Fix Database Connection (Proper Fix)

#### Step 1: Check Database Connection
```bash
# Test database connection
curl https://your-domain.vercel.app/api/health
```

#### Step 2: Run Database Migration
```bash
# Set environment variables
vercel env pull

# Run migration
npx prisma migrate deploy
```

#### Step 3: Create Department Data
```bash
# Create departments using the API
curl -X POST https://your-domain.vercel.app/api/create-departments
```

### Solution 3: Debug API Deployment

#### Check if API functions are deployed:
1. Go to Vercel Dashboard → Functions tab
2. Look for `api/department-counts` function
3. Check function logs for errors

#### Test API endpoints:
```bash
# Test simple API
curl https://your-domain.vercel.app/api/test-simple

# Test department counts
curl https://your-domain.vercel.app/api/department-counts
```

## 🔧 Files Created for Debugging

1. **`test-api-deployment.html`** - Test all API endpoints
2. **`fix-department-api.html`** - Comprehensive diagnostic tool
3. **`api/test-simple.ts`** - Simple test API
4. **`api/department-counts-simple.ts`** - Simplified department API

## 📋 Step-by-Step Fix Process

### Option A: Quick Fix (Use Simplified API)
```bash
# 1. Backup original API
mv api/department-counts.ts api/department-counts-backup.ts

# 2. Use simplified API
mv api/department-counts-simple.ts api/department-counts.ts

# 3. Deploy
git add .
git commit -m "Use simplified department API"
git push
```

### Option B: Fix Database Issues
```bash
# 1. Check environment variables in Vercel
# 2. Run database migration
npx prisma migrate deploy

# 3. Create department data
curl -X POST https://your-domain.vercel.app/api/create-departments

# 4. Test the API
curl https://your-domain.vercel.app/api/department-counts
```

## 🧪 Testing

After implementing the fix:

1. **Test the API directly:**
   ```bash
   curl https://your-domain.vercel.app/api/department-counts
   ```
   Should return JSON, not HTML.

2. **Test the frontend:**
   - Go to the Departments page
   - Should show department data instead of error

3. **Use diagnostic tools:**
   - Open `test-api-deployment.html` in browser
   - Run all tests to verify functionality

## 🚀 Expected Results

After the fix:
- ✅ Departments page loads successfully
- ✅ Shows LISH AI LABS department data
- ✅ Allows editing department counts
- ✅ No more "API Connection Issue" error

## 📞 Support

If issues persist:
1. Check Vercel function logs
2. Verify environment variables
3. Test database connection
4. Use the diagnostic tools provided
