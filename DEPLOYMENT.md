# Vercel Deployment Guide

## Prerequisites
1. Vercel account (https://vercel.com)
2. GitHub repository connected to Vercel
3. Database setup (PostgreSQL recommended for production)

## Environment Variables Setup

### Required Environment Variables in Vercel Dashboard:

1. **DATABASE_URL**
   - For production, use a PostgreSQL database (Neon, Supabase, or Railway)
   - Example: `postgresql://username:password@host:port/database`

2. **JWT_SECRET**
   - Generate a strong secret key
   - Example: `your-super-secure-jwt-secret-key-here`

3. **ADMIN_USERNAME**
   - Admin login username
   - Example: `admin`

4. **ADMIN_PASSWORD**
   - Admin login password (use a strong password)
   - Example: `your-secure-admin-password`

5. **CORS_ORIGINS**
   - Allowed origins for CORS
   - Example: `https://your-domain.vercel.app,https://www.your-domain.com`

6. **NODE_ENV**
   - Set to `production`

## Deployment Steps

### 1. Connect Repository to Vercel
1. Go to https://vercel.com/dashboard
2. Click "New Project"
3. Import your GitHub repository
4. Select the repository: `lish-survey`

### 2. Configure Build Settings
- **Framework Preset**: Other
- **Root Directory**: Leave empty (uses root)
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

### 3. Set Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:
```
DATABASE_URL=postgresql://username:password@host:port/database
JWT_SECRET=your-super-secure-jwt-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password
CORS_ORIGINS=https://your-domain.vercel.app
NODE_ENV=production
```

### 4. Deploy
1. Click "Deploy" in Vercel Dashboard
2. Wait for build to complete
3. Check deployment logs for any errors

## Database Setup

### Option 1: Neon (Recommended)
1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Use as DATABASE_URL in Vercel

### Option 2: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Use as DATABASE_URL in Vercel

### Option 3: Railway
1. Go to https://railway.app
2. Create a new PostgreSQL database
3. Copy the connection string
4. Use as DATABASE_URL in Vercel

## Post-Deployment Setup

### 1. Run Database Migrations
After deployment, you'll need to run Prisma migrations:
```bash
npx prisma migrate deploy
```

### 2. Test the Application
1. Visit your Vercel URL
2. Test the survey form
3. Test admin login at `/admin`
4. Verify API endpoints work

## Troubleshooting

### Common Issues:

1. **Build Fails**
   - Check that all dependencies are in package.json
   - Ensure TypeScript compilation succeeds
   - Check build logs in Vercel dashboard

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Ensure database is accessible from Vercel
   - Check if database requires SSL

3. **API Routes Not Working**
   - Verify vercel.json configuration
   - Check that API files are in the correct location
   - Ensure proper exports in API files

4. **Frontend Not Loading**
   - Check that frontend build completed successfully
   - Verify routes configuration in vercel.json
   - Check browser console for errors

### Debug Commands:
```bash
# Test build locally
npm run build

# Test API locally
npm run start:dev

# Check Vercel CLI
npx vercel --version
```

## Production Checklist

- [ ] Environment variables set in Vercel
- [ ] Database configured and accessible
- [ ] JWT secret is secure
- [ ] Admin credentials are strong
- [ ] CORS origins are properly configured
- [ ] SSL certificate is working
- [ ] All API endpoints tested
- [ ] Frontend loads correctly
- [ ] Survey form submission works
- [ ] Admin dashboard accessible
