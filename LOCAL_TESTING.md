# Local Testing Guide

This guide will help you test the LISH AI LABS Policy Survey backend locally before deploying to Vercel.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or Neon)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Copy the environment template:
```bash
cp env.local.example .env.local
```

Edit `.env.local` with your database connection:
```bash
# For local PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/lish_survey_local?schema=public"

# For Neon (recommended)
DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/lish_survey?sslmode=require"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed with sample data
npm run db:seed
```

### 4. Start Local Server

```bash
# Start with auto-reload
npm run dev:watch

# Or start once
npm run start:local
```

The server will start on `http://localhost:5000`

## Testing Options

### Option 1: Automated Tests

```bash
# Run all tests
npm test

# Run only API tests
npm run test:api

# Run tests in watch mode
npm run test:watch
```

### Option 2: Manual API Testing

```bash
# Run the test script
npm run test:manual
```

### Option 3: Manual Testing with curl/Postman

#### Health Check
```bash
curl http://localhost:5000/health
```

#### Submit Survey Response
```bash
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "department": "Technical Team",
    "awareness": {
      "antiSocialBehavior": 4,
      "antiDiscrimination": 5,
      "sexualHarassment": 3,
      "safeguarding": 4,
      "hrPolicyManual": 2,
      "codeOfConduct": 4,
      "financeWellness": 3,
      "workLifeBalance": 4,
      "digitalWorkplace": 5,
      "softSkills": 3,
      "professionalism": 4
    },
    "urgentTrainings": ["Anti-Social Behavior Policy"],
    "confidenceLevel": "Confident",
    "facedUnsureSituation": false,
    "knewReportingChannel": "Yes",
    "trainingMethod": "In-person training sessions",
    "refresherFrequency": "1 training /Monthly"
  }'
```

#### Admin Login
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "lish2025"
  }'
```

#### Get Responses (with token from login)
```bash
curl -X GET http://localhost:5000/api/responses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Export CSV (with token)
```bash
curl -X GET http://localhost:5000/api/export \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -o survey_responses.csv
```

## Database Management

### View Data
```bash
# Open Prisma Studio (web interface)
npm run db:studio
```

### Reset Database
```bash
# Clear all data
npx prisma db push --force-reset

# Re-seed with sample data
npm run db:seed
```

### Create Migration
```bash
npm run db:migrate
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify DATABASE_URL is correct
   - Check if database server is running
   - Ensure database exists

2. **Port Already in Use**
   - Change PORT in `.env.local`
   - Kill process using port 5000: `lsof -ti:5000 | xargs kill -9`

3. **Prisma Client Not Generated**
   - Run `npm run db:generate`
   - Check if schema.prisma is valid

4. **CORS Issues**
   - Update CORS_ORIGINS in `.env.local`
   - Add your frontend URL to allowed origins

### Debug Mode

Set environment variable for detailed logging:
```bash
DEBUG=* npm run start:dev
```

### Check Logs

The server logs all requests and errors to console. Look for:
- ✅ Successful operations
- ❌ Error messages
- 🔄 Database operations

## API Endpoints Summary

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/health` | Health check | No |
| POST | `/api/submit` | Submit survey | No |
| POST | `/api/login` | Admin login | No |
| GET | `/api/responses` | Get responses | Yes |
| GET | `/api/export` | Export CSV | Yes |

## Next Steps

Once local testing is successful:

1. **Deploy to Vercel**: `vercel --prod`
2. **Set Environment Variables** in Vercel dashboard
3. **Run Database Migrations**: `npx prisma db push`
4. **Test Production Endpoints**

## Support

If you encounter issues:
1. Check the console logs
2. Verify environment variables
3. Test database connection
4. Review the error messages
5. Check the troubleshooting section above
