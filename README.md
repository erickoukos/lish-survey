# LISH AI LABS Policy Survey - Production Ready Backend

A comprehensive backend API for the LISH AI LABS Policy Awareness & Training Needs Survey, built with Node.js, TypeScript, Prisma, and PostgreSQL, optimized for Vercel deployment.

## Features

- **Serverless Architecture**: Optimized for Vercel serverless functions
- **Database**: PostgreSQL with Prisma ORM and connection pooling
- **Authentication**: JWT-based admin authentication
- **Rate Limiting**: Built-in rate limiting for API protection
- **Data Export**: CSV export functionality for survey responses
- **Validation**: Comprehensive input validation with Zod
- **Security**: CORS protection, input sanitization, and secure headers

## Tech Stack

- **Runtime**: Node.js 18+
- **Language**: TypeScript
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: JWT
- **Validation**: Zod
- **Deployment**: Vercel

## Project Structure

```
├── api/                    # Vercel serverless functions
│   ├── submit.ts          # Submit survey response
│   ├── responses.ts       # Get paginated responses (admin)
│   ├── export.ts          # Export responses as CSV (admin)
│   └── login.ts           # Admin authentication
├── src/                   # Shared utilities
│   └── lib/
│       ├── prisma.ts      # Prisma client configuration
│       ├── auth.ts        # JWT authentication utilities
│       ├── validation.ts  # Zod validation schemas
│       ├── rateLimiter.ts # Rate limiting utilities
│       └── cors.ts        # CORS configuration
├── prisma/
│   └── schema.prisma      # Database schema
├── package.json
├── tsconfig.json
├── vercel.json
└── env.example
```

## API Endpoints

### Public Endpoints

#### POST /api/submit
Submit a survey response.

**Request Body:**
```json
{
  "department": "Technical Team",
  "awareness": {
    "antiSocialBehavior": 4,
    "antiDiscrimination": 3,
    // ... other awareness fields
  },
  "urgentTrainings": ["Anti-Social Behavior Policy"],
  // ... other survey fields
}
```

**Response:**
```json
{
  "success": true,
  "id": "uuid",
  "message": "Survey response submitted successfully"
}
```

### Admin Endpoints (Require JWT Authentication)

#### POST /api/login
Authenticate admin user.

**Request Body:**
```json
{
  "username": "admin",
  "password": "lish2025"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "admin",
    "username": "admin"
  }
}
```

#### GET /api/responses
Get paginated survey responses.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10, max: 100)
- `department` (optional): Filter by department

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### GET /api/export
Export all responses as CSV.

**Headers:**
- `Authorization: Bearer <jwt-token>`

**Response:** CSV file download

## Setup Instructions

### 1. Environment Variables

Copy `env.example` to `.env.local` and configure:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/lish_survey?schema=public"

# JWT Secret (generate a strong secret for production)
JWT_SECRET="your-super-secret-jwt-key-here"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="lish2025"

# CORS Origins
CORS_ORIGINS="http://localhost:3000,https://your-frontend-domain.vercel.app"
```

### 2. Database Setup

1. **Create Neon Database:**
   - Sign up at [Neon](https://neon.tech)
   - Create a new database
   - Copy the connection string

2. **Update DATABASE_URL:**
   ```bash
   DATABASE_URL="postgresql://username:password@ep-xxx.us-east-1.aws.neon.tech/lish_survey?sslmode=require"
   ```

3. **Run Database Migrations:**
   ```bash
   npm run db:generate
   npm run db:push
   ```

### 3. Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Vercel Deployment

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel --prod
   ```

3. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings
   - Add all environment variables from `env.example`

4. **Run Database Migrations:**
   ```bash
   npx prisma db push
   ```

## Database Schema

The `SurveyResponse` table includes:

- **Basic Info**: `id`, `department`, `createdAt`
- **Awareness Scores**: JSON field with 1-5 ratings for various policies
- **Training Needs**: Arrays for different categories of training needs
- **Workplace Practices**: Information about observed issues and reporting
- **Training Preferences**: Method and frequency preferences
- **Open Feedback**: Text fields for additional comments

## Security Features

- **Rate Limiting**: 5 requests per minute per IP
- **JWT Authentication**: Secure admin access
- **Input Validation**: Comprehensive validation with Zod
- **CORS Protection**: Configurable allowed origins
- **SQL Injection Protection**: Prisma ORM prevents SQL injection
- **XSS Protection**: Input sanitization

## Performance Optimizations

- **Connection Pooling**: Optimized for serverless functions
- **Lazy Loading**: Prisma client initialization
- **Pagination**: Efficient data retrieval
- **Caching**: Rate limiter with in-memory storage

## Monitoring and Logging

- **Console Logging**: Request tracking and error logging
- **Error Handling**: Comprehensive error responses
- **Performance Monitoring**: Vercel Analytics integration

## Development Commands

```bash
# Development
npm run dev              # Start Vercel dev server
npm run build            # Build TypeScript

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio

# Testing
npm test                # Run tests
npm run lint            # Lint code
npm run lint:fix        # Fix linting issues

# Deployment
npm run deploy          # Deploy to Vercel
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues:**
   - Verify DATABASE_URL is correct
   - Check if database is accessible
   - Ensure connection pooling URL is used

2. **Authentication Issues:**
   - Verify JWT_SECRET is set
   - Check token expiration
   - Ensure proper Authorization header format

3. **Rate Limiting:**
   - Check if IP is being rate limited
   - Verify rate limiter configuration

4. **CORS Issues:**
   - Verify CORS_ORIGINS configuration
   - Check if frontend domain is allowed

### Support

For issues and questions:
- Check the logs in Vercel dashboard
- Verify environment variables
- Test API endpoints with tools like Postman
- Review Prisma documentation for database issues

## License

MIT License - see LICENSE file for details.