import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../src/lib/prisma'
import { cors } from '../src/lib/cors'

// Migration endpoint to create tables and seed data
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res)

  if (req.method === 'POST') {
    try {
      console.log('🚀 Starting database migration for question management...')

      // Step 1: Test database connection
      await prisma.$connect()
      console.log('✅ Database connection successful')

      // Step 2: Check if tables exist by trying to query them
      let tablesExist = false
      try {
        await prisma.surveySection.findFirst()
        await prisma.surveyQuestion.findFirst()
        tablesExist = true
        console.log('✅ Tables already exist')
      } catch (error) {
        console.log('⚠️ Tables do not exist, will create them')
      }

      if (!tablesExist) {
        // Step 3: Create tables using raw SQL
        console.log('📊 Creating database tables...')
        
        // Create SurveySection table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "survey_sections" (
            "id" TEXT NOT NULL,
            "sectionKey" TEXT NOT NULL,
            "title" TEXT NOT NULL,
            "description" TEXT,
            "order" INTEGER NOT NULL,
            "isActive" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            CONSTRAINT "survey_sections_pkey" PRIMARY KEY ("id")
          )
        `

        // Create SurveyQuestion table
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "survey_questions" (
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
          )
        `

        // Create unique constraints
        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "survey_questions_section_questionNumber_key" 
          ON "survey_questions"("section", "questionNumber")
        `

        await prisma.$executeRaw`
          CREATE UNIQUE INDEX IF NOT EXISTS "survey_sections_sectionKey_key" 
          ON "survey_sections"("sectionKey")
        `

        console.log('✅ Database tables created successfully')
      }

      // Step 4: Seed default sections if they don't exist
      const sectionCount = await prisma.surveySection.count()
      if (sectionCount === 0) {
        console.log('🌱 Seeding default sections...')
        
        const sections = [
          {
            id: 'section-a',
            sectionKey: 'A',
            title: 'General Information',
            description: 'Basic demographic and department information',
            order: 1,
            isActive: true
          },
          {
            id: 'section-b',
            sectionKey: 'B',
            title: 'Awareness & Understanding',
            description: 'Policy awareness and understanding levels',
            order: 2,
            isActive: true
          },
          {
            id: 'section-c',
            sectionKey: 'C',
            title: 'Urgent Trainings',
            description: 'Immediate training needs and priorities',
            order: 3,
            isActive: true
          },
          {
            id: 'section-d',
            sectionKey: 'D',
            title: 'Finance & Wellness',
            description: 'Financial wellness and literacy needs',
            order: 4,
            isActive: true
          },
          {
            id: 'section-e',
            sectionKey: 'E',
            title: 'Culture & Wellness',
            description: 'Workplace culture and mental health needs',
            order: 5,
            isActive: true
          },
          {
            id: 'section-f',
            sectionKey: 'F',
            title: 'Digital Skills',
            description: 'Digital literacy and technology skills',
            order: 6,
            isActive: true
          },
          {
            id: 'section-g',
            sectionKey: 'G',
            title: 'Professional Development',
            description: 'Career development and soft skills needs',
            order: 7,
            isActive: true
          },
          {
            id: 'section-h',
            sectionKey: 'H',
            title: 'Observed Issues',
            description: 'Workplace issues and concerns',
            order: 8,
            isActive: true
          },
          {
            id: 'section-i',
            sectionKey: 'I',
            title: 'Training Methods',
            description: 'Preferred training delivery methods',
            order: 9,
            isActive: true
          },
          {
            id: 'section-j',
            sectionKey: 'J',
            title: 'Final Questions',
            description: 'Additional feedback and suggestions',
            order: 10,
            isActive: true
          }
        ]

        // Insert sections
        for (const section of sections) {
          await prisma.surveySection.create({
            data: section
          })
        }

        console.log('✅ Default sections created')
      }

      // Step 5: Final verification
      const finalSectionCount = await prisma.surveySection.count()
      const finalQuestionCount = await prisma.surveyQuestion.count()

      console.log(`🎉 Migration completed: ${finalSectionCount} sections, ${finalQuestionCount} questions`)

      res.status(200).json({ 
        success: true, 
        message: 'Database migration completed successfully',
        data: {
          sections: finalSectionCount,
          questions: finalQuestionCount
        }
      })

    } catch (error) {
      console.error('❌ Migration failed:', error)
      res.status(500).json({ 
        success: false, 
        error: 'Migration failed', 
        details: error.message 
      })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
