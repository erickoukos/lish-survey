# Vercel Deployment Fixes

## Issues Fixed

### 1. Database Configuration
- **Problem**: Prisma schema was configured for SQLite but environment variables were set for PostgreSQL
- **Solution**: Updated `prisma/schema.prisma` to use PostgreSQL provider

### 2. Vercel Configuration
- **Problem**: Missing function timeout configuration
- **Solution**: Added `functions` configuration with 30-second timeout for API routes

### 3. Build Process
- **Problem**: Build script was trying to compile TypeScript backend unnecessarily
- **Solution**: Removed backend TypeScript compilation from build process (Vercel handles this automatically)

### 4. Environment Variables
- **Problem**: CORS origins pointing to old domain
- **Solution**: Updated to use placeholder for your actual Vercel domain

## Deployment Steps

### 1. Update Environment Variables in Vercel Dashboard

Go to your Vercel project settings and update these environment variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_5Uf8wLsuIkFX@ep-odd-mountain-abu9qwk9-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=f8d5acdf84771e85f4467c6784684a47dc0952fd1fd924db9eb2f26575e887de1075b9ec2207972cec11c4b9cbe74542e894915dddad5da9c37319c7f96974cd
ADMIN_USERNAME=admin
ADMIN_PASSWORD=lish2025
CORS_ORIGINS=https://your-actual-domain.vercel.app
NODE_ENV=production
```

### 2. Run Database Migration

After deployment, you need to run the database migration:

```bash
# In your local terminal, run:
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull
npx prisma migrate deploy
```

### 3. Test the Deployment

1. Visit your Vercel URL
2. Test the survey form submission
3. Test admin login at `/admin`
4. Check API endpoints:
   - `/api/health` - Should return `{"status":"ok"}`
   - `/api/login` - Test admin login
   - `/api/responses` - Test with admin token

## Common Issues and Solutions

### Database Connection Issues
- Ensure your PostgreSQL database is accessible from Vercel
- Check that SSL is enabled (`sslmode=require`)
- Verify the connection string is correct

### API Routes Not Working
- Check that all API files are in the `api/` directory
- Ensure each API file exports a default function
- Check Vercel function logs for errors

### Frontend Not Loading
- Verify the build completed successfully
- Check that `frontend/dist` directory exists
- Ensure routes in `vercel.json` are correct

### CORS Issues
- Update `CORS_ORIGINS` with your actual Vercel domain
- Check that the domain matches exactly (including https://)

## Build Configuration

The project now uses this build configuration:
- **Build Command**: `npm run build`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`

## File Structure for Vercel

```
/
├── api/                 # API routes (serverless functions)
├── frontend/           # Frontend React app
│   ├── dist/          # Built frontend (generated)
│   └── package.json   # Frontend dependencies
├── prisma/            # Database schema
├── src/lib/           # Shared utilities
├── vercel.json        # Vercel configuration
└── package.json       # Root dependencies
```

## Next Steps

1. Deploy to Vercel
2. Update environment variables
3. Run database migration
4. Test all functionality
5. Update CORS origins with your actual domain
