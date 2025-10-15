const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixSurveySetRelationships() {
  try {
    console.log('🔧 Fixing survey set relationships...')

    // Step 1: Create a default survey set if it doesn't exist
    let defaultSurveySet = await prisma.surveySet.findFirst({
      where: { name: 'LISH AI LABS Policy Survey' }
    })

    if (!defaultSurveySet) {
      console.log('📝 Creating default survey set...')
      defaultSurveySet = await prisma.surveySet.create({
        data: {
          name: 'LISH AI LABS Policy Survey',
          description: 'Default survey set for LISH AI LABS policy awareness and training needs assessment',
          isActive: true
        }
      })
      console.log('✅ Default survey set created')
    } else {
      console.log('✅ Default survey set already exists')
    }

    // Step 2: Check if sections exist and need to be linked
    const allSections = await prisma.surveySection.findMany()
    console.log(`📊 Found ${allSections.length} existing sections`)

    // Step 3: Check if questions exist and need to be linked
    const allQuestions = await prisma.surveyQuestion.findMany()
    console.log(`📊 Found ${allQuestions.length} existing questions`)

    // Step 4: Create default questions if none exist
    const questionCount = await prisma.surveyQuestion.count({
      where: { surveySetId: defaultSurveySet.id }
    })

    if (questionCount === 0) {
      console.log('🌱 Creating default questions...')
      
      const defaultQuestions = [
        // Section A - General Information
        { section: 'A', questionType: 'select', questionText: 'What is your department?', questionNumber: 1, options: JSON.stringify(['Technical Team', 'Data Annotation Team', 'Digital Marketing Department', 'HR & Administration Department', 'Finance & Accounting Department', 'Project Management Department', 'Sanitation Department', 'Security Department', 'Head of Department (HODs)']) },
        { section: 'A', questionType: 'text', questionText: 'What is your employee ID?', questionNumber: 2, placeholder: 'Enter your employee ID' },
        
        // Section B - Awareness & Understanding
        { section: 'B', questionType: 'rating', questionText: 'How aware are you of the Anti-Social Behavior Policy?', questionNumber: 1, options: JSON.stringify(['1', '2', '3', '4', '5']) },
        { section: 'B', questionType: 'rating', questionText: 'How aware are you of the Anti-Discrimination Policy?', questionNumber: 2, options: JSON.stringify(['1', '2', '3', '4', '5']) },
        
        // Section C - Urgent Trainings
        { section: 'C', questionType: 'checkbox', questionText: 'Which trainings do you need urgently?', questionNumber: 1, options: JSON.stringify(['Anti-Social Behavior Policy', 'Anti-Discrimination Policy', 'Harassment Prevention', 'Safeguarding for Vulnerable Persons']) },
        
        // Section D - Finance & Wellness
        { section: 'D', questionType: 'checkbox', questionText: 'What financial wellness topics interest you?', questionNumber: 1, options: JSON.stringify(['Budgeting', 'Investment Basics', 'Debt Management', 'Retirement Planning']) },
        
        // Section E - Culture & Wellness
        { section: 'E', questionType: 'checkbox', questionText: 'What workplace culture improvements do you need?', questionNumber: 1, options: JSON.stringify(['Team Building', 'Communication Skills', 'Conflict Resolution', 'Work-Life Balance']) },
        
        // Section F - Digital Skills
        { section: 'F', questionType: 'checkbox', questionText: 'What digital skills do you want to develop?', questionNumber: 1, options: JSON.stringify(['Basic Computer Skills', 'Microsoft Office', 'Digital Marketing', 'Data Analysis']) },
        
        // Section G - Professional Development
        { section: 'G', questionType: 'checkbox', questionText: 'What professional development areas interest you?', questionNumber: 1, options: JSON.stringify(['Leadership Skills', 'Project Management', 'Communication', 'Technical Skills']) },
        
        // Section H - Observed Issues
        { section: 'H', questionType: 'checkbox', questionText: 'What issues have you observed in the workplace?', questionNumber: 1, options: JSON.stringify(['Anti-social behavior', 'Discrimination', 'Harassment', 'Lack of safeguarding', 'None of the above']) },
        
        // Section I - Training Methods
        { section: 'I', questionType: 'radio', questionText: 'What is your preferred training method?', questionNumber: 1, options: JSON.stringify(['In-person training sessions', 'Self-paced e-learning modules', 'Shared Policy handbooks']) },
        
        // Section J - Final Questions
        { section: 'J', questionType: 'textarea', questionText: 'Any additional comments or suggestions?', questionNumber: 1, placeholder: 'Please share any additional thoughts...' }
      ]

      for (const question of defaultQuestions) {
        await prisma.surveyQuestion.create({
          data: {
            ...question,
            surveySetId: defaultSurveySet.id,
            isRequired: true,
            isActive: true
          }
        })
      }
      
      console.log(`✅ Created ${defaultQuestions.length} default questions`)
    } else {
      console.log(`✅ Survey set already has ${questionCount} questions`)
    }

    // Step 5: Verify the results
    const finalSectionCount = await prisma.surveySection.count({
      where: { surveySetId: defaultSurveySet.id }
    })
    
    const finalQuestionCount = await prisma.surveyQuestion.count({
      where: { surveySetId: defaultSurveySet.id }
    })

    console.log('')
    console.log('🎉 Survey set relationships fixed successfully!')
    console.log(`📊 Survey Set: ${defaultSurveySet.name}`)
    console.log(`📋 Sections: ${finalSectionCount}`)
    console.log(`❓ Questions: ${finalQuestionCount}`)
    console.log('')
    console.log('✅ The survey set should now show the correct number of questions in the dashboard.')

  } catch (error) {
    console.error('❌ Error fixing survey set relationships:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
fixSurveySetRelationships()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
