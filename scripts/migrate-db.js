const { PrismaClient } = require('@prisma/client')

async function migrateDatabase() {
  const prisma = new PrismaClient()
  
  try {
    console.log('Starting database migration...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected successfully')
    
    // Check if tables exist by trying to query them
    try {
      await prisma.surveyConfig.findFirst()
      console.log('✅ SurveyConfig table exists')
    } catch (error) {
      console.log('❌ SurveyConfig table does not exist, creating...')
      
      // Create the surveyConfig table manually
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "survey_config" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "startDate" TIMESTAMP(3) NOT NULL,
          "endDate" TIMESTAMP(3) NOT NULL,
          "title" TEXT NOT NULL DEFAULT 'Policy Awareness Survey',
          "description" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL
        )
      `
      console.log('✅ SurveyConfig table created')
    }
    
    try {
      await prisma.surveyResponse.findFirst()
      console.log('✅ SurveyResponse table exists')
    } catch (error) {
      console.log('❌ SurveyResponse table does not exist, creating...')
      
      // Create the surveyResponse table manually
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "survey_responses" (
          "id" TEXT NOT NULL PRIMARY KEY,
          "department" TEXT NOT NULL,
          "awareness" TEXT NOT NULL,
          "urgentTrainings" TEXT NOT NULL,
          "urgentTrainingsOther" TEXT,
          "financeWellnessNeeds" TEXT NOT NULL,
          "cultureWellnessNeeds" TEXT NOT NULL,
          "cultureWellnessOther" TEXT,
          "digitalSkillsNeeds" TEXT NOT NULL,
          "digitalSkillsOther" TEXT,
          "professionalDevNeeds" TEXT NOT NULL,
          "professionalDevOther" TEXT,
          "confidenceLevel" TEXT NOT NULL,
          "facedUnsureSituation" BOOLEAN NOT NULL,
          "unsureSituationDescription" TEXT,
          "observedIssues" TEXT NOT NULL,
          "observedIssuesOther" TEXT,
          "knewReportingChannel" TEXT NOT NULL,
          "trainingMethod" TEXT NOT NULL,
          "trainingMethodOther" TEXT,
          "refresherFrequency" TEXT NOT NULL,
          "prioritizedPolicies" TEXT,
          "prioritizationReason" TEXT,
          "policyChallenges" TEXT,
          "complianceSuggestions" TEXT,
          "generalComments" TEXT,
          "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `
      console.log('✅ SurveyResponse table created')
    }
    
    // Create default survey configuration
    try {
      const existingConfig = await prisma.surveyConfig.findFirst()
      if (!existingConfig) {
        const defaultConfig = await prisma.surveyConfig.create({
          data: {
            id: 'default',
            isActive: true,
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            title: 'Policy Awareness Survey',
            description: 'LISH AI LABS Policy Awareness & Training Needs Survey'
          }
        })
        console.log('✅ Default survey configuration created')
      } else {
        console.log('✅ Survey configuration already exists')
      }
    } catch (error) {
      console.error('Error creating default config:', error)
    }
    
    console.log('🎉 Database migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  migrateDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error)
      process.exit(1)
    })
}

module.exports = { migrateDatabase }
