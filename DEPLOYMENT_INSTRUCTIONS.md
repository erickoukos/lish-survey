# Question Management System Deployment Instructions

## 🚀 Database Migration Required

The question management system requires database tables to be created. Follow these steps to complete the setup:

### Step 1: Run Database Migration in Production

Since the `DATABASE_URL` is only available in the production environment (Vercel), you need to run the migration there:

#### Option A: Using Vercel CLI (Recommended)
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Run migration in production
vercel env pull .env.local
npx prisma migrate dev --name add_question_management
```

#### Option B: Using Vercel Dashboard
1. Go to your Vercel dashboard
2. Navigate to your project settings
3. Go to "Environment Variables"
4. Ensure `DATABASE_URL` is set
5. Go to "Functions" tab
6. Run the migration command in the function logs

#### Option C: Direct Database Push (Faster)
```bash
# In production environment
npx prisma db push
```

### Step 2: Seed Default Data (Optional)

After the migration, you can optionally seed the database with default sections and questions:

```bash
node scripts/setup-question-management.js
```

### Step 3: Verify the Fix

1. Refresh your application
2. Click the "Questions" button in the admin dashboard
3. You should now see the question management interface without errors

## 🔧 Alternative: Manual Database Setup

If you have direct database access, you can run these SQL commands:

```sql
-- Create SurveySection table
CREATE TABLE "survey_sections" (
    "id" TEXT NOT NULL,
    "sectionKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "survey_sections_pkey" PRIMARY KEY ("id")
);

-- Create SurveyQuestion table
CREATE TABLE "survey_questions" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "questionType" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "isRequired" BOOLEAN NOT NULL DEFAULT true,
    "options" TEXT,
    "validationRules" TEXT,
    "placeholder" TEXT,
    "helpText" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- Create unique constraint
CREATE UNIQUE INDEX "survey_questions_section_questionNumber_key" ON "survey_questions"("section", "questionNumber");
CREATE UNIQUE INDEX "survey_sections_sectionKey_key" ON "survey_sections"("sectionKey");
```

## 🎯 Expected Results

After completing the migration:

1. **Questions Button**: Will work without 500 errors
2. **Question Management Interface**: Will load with default sections
3. **Add/Edit/Delete Questions**: Full functionality available
4. **Dynamic Survey Form**: Questions will be loaded dynamically

## 🆘 Troubleshooting

### If you still see errors:
1. Check that the migration completed successfully
2. Verify the `DATABASE_URL` is correct in production
3. Check the Vercel function logs for any errors
4. Try refreshing the page after migration

### If tables exist but no data:
Run the seed script: `node scripts/setup-question-management.js`

## 📞 Support

If you encounter any issues, check:
1. Vercel function logs
2. Database connection status
3. Environment variables in Vercel dashboard
4. Prisma client generation: `npx prisma generate`
