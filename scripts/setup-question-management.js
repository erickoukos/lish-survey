const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupQuestionManagement() {
  try {
    console.log('🚀 Setting up question management system...')

    // Check if tables exist by trying to query them
    let tablesExist = false
    try {
      await prisma.surveySection.findFirst()
      await prisma.surveyQuestion.findFirst()
      tablesExist = true
      console.log('✅ Database tables already exist')
    } catch (error) {
      console.log('⚠️  Database tables do not exist yet')
      console.log('📋 To create the tables, run the following command:')
      console.log('   npx prisma migrate dev --name add_question_management')
      console.log('')
      console.log('🔧 Alternative: Run this command to generate and apply migration:')
      console.log('   npx prisma db push')
      console.log('')
      console.log('📝 Note: You need to run this in your production environment with proper DATABASE_URL')
    }

    if (tablesExist) {
      // Check if we have any sections
      const sectionCount = await prisma.surveySection.count()
      const questionCount = await prisma.surveyQuestion.count()

      console.log(`📊 Current data: ${sectionCount} sections, ${questionCount} questions`)

      if (sectionCount === 0) {
        console.log('🌱 Seeding default sections and questions...')
        
        // Create default sections
        const sections = [
          {
            sectionKey: 'A',
            title: 'General Information',
            description: 'Basic demographic and department information',
            order: 1,
            isActive: true
          },
          {
            sectionKey: 'B',
            title: 'Awareness & Understanding',
            description: 'Policy awareness and understanding levels',
            order: 2,
            isActive: true
          },
          {
            sectionKey: 'C',
            title: 'Urgent Trainings',
            description: 'Immediate training needs and priorities',
            order: 3,
            isActive: true
          },
          {
            sectionKey: 'D',
            title: 'Finance & Wellness',
            description: 'Financial wellness and literacy needs',
            order: 4,
            isActive: true
          },
          {
            sectionKey: 'E',
            title: 'Culture & Wellness',
            description: 'Workplace culture and mental health needs',
            order: 5,
            isActive: true
          },
          {
            sectionKey: 'F',
            title: 'Digital Skills',
            description: 'Digital literacy and technology skills',
            order: 6,
            isActive: true
          },
          {
            sectionKey: 'G',
            title: 'Professional Development',
            description: 'Career development and soft skills needs',
            order: 7,
            isActive: true
          },
          {
            sectionKey: 'H',
            title: 'Observed Issues',
            description: 'Workplace issues and concerns',
            order: 8,
            isActive: true
          },
          {
            sectionKey: 'I',
            title: 'Training Methods',
            description: 'Preferred training delivery methods',
            order: 9,
            isActive: true
          },
          {
            sectionKey: 'J',
            title: 'Final Questions',
            description: 'Additional feedback and suggestions',
            order: 10,
            isActive: true
          }
        ]

        // Create sections
        for (const section of sections) {
          await prisma.surveySection.upsert({
            where: { sectionKey: section.sectionKey },
            update: section,
            create: section
          })
          console.log(`✅ Created section: ${section.title}`)
        }

        console.log('🎉 Question management system setup complete!')
        console.log('')
        console.log('📋 Next steps:')
        console.log('1. The question management interface should now work')
        console.log('2. You can add questions through the admin dashboard')
        console.log('3. Questions will be dynamically loaded in the survey form')
      } else {
        console.log('✅ Question management system is already set up')
      }
    }

  } catch (error) {
    console.error('❌ Error setting up question management:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  setupQuestionManagement()
    .then(() => {
      console.log('✅ Setup completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Setup failed:', error)
      process.exit(1)
    })
}

module.exports = { setupQuestionManagement }
