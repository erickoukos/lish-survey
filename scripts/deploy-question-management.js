#!/usr/bin/env node

/**
 * Deploy Question Management System
 * 
 * This script sets up the question management system in production.
 * Run this in your production environment where DATABASE_URL is available.
 */

const { PrismaClient } = require('@prisma/client')
const { execSync } = require('child_process')

const prisma = new PrismaClient()

async function deployQuestionManagement() {
  try {
    console.log('🚀 Deploying Question Management System...')
    console.log('')

    // Step 1: Check if DATABASE_URL is available
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL environment variable not found!')
      console.error('   Please ensure DATABASE_URL is set in your production environment.')
      process.exit(1)
    }

    console.log('✅ DATABASE_URL found')
    console.log('')

    // Step 2: Run database migration
    console.log('📊 Running database migration...')
    try {
      execSync('npx prisma db push', { stdio: 'inherit' })
      console.log('✅ Database migration completed')
    } catch (error) {
      console.error('❌ Database migration failed:', error.message)
      process.exit(1)
    }
    console.log('')

    // Step 3: Check if tables exist
    console.log('🔍 Verifying database tables...')
    try {
      const sectionCount = await prisma.surveySection.count()
      const questionCount = await prisma.surveyQuestion.count()
      console.log(`✅ Tables created: ${sectionCount} sections, ${questionCount} questions`)
    } catch (error) {
      console.error('❌ Tables not found:', error.message)
      process.exit(1)
    }
    console.log('')

    // Step 4: Seed default data if no sections exist
    const sectionCount = await prisma.surveySection.count()
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

      console.log('✅ Default sections created')
    } else {
      console.log('✅ Sections already exist, skipping seed')
    }
    console.log('')

    // Step 5: Final verification
    console.log('🎯 Final verification...')
    const finalSectionCount = await prisma.surveySection.count()
    const finalQuestionCount = await prisma.surveyQuestion.count()
    
    console.log(`📊 Database status: ${finalSectionCount} sections, ${finalQuestionCount} questions`)
    console.log('')
    console.log('🎉 Question Management System deployed successfully!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('1. Refresh your application')
    console.log('2. Click the "Questions" button in the admin dashboard')
    console.log('3. Start managing your survey questions!')
    console.log('')

  } catch (error) {
    console.error('❌ Deployment failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  deployQuestionManagement()
    .then(() => {
      console.log('✅ Deployment completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Deployment failed:', error)
      process.exit(1)
    })
}

module.exports = { deployQuestionManagement }
