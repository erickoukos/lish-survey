const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function migrateToSurveySets() {
  try {
    console.log('Starting migration to survey sets...')
    
    // First, create a default survey set for existing data
    const defaultSurveySet = await prisma.surveySet.create({
      data: {
        name: 'Default Survey Set',
        description: 'Default survey set for existing data',
        isActive: true
      }
    })
    
    console.log('Created default survey set:', defaultSurveySet.id)
    
    // Update existing survey_config records
    const configs = await prisma.surveyConfig.findMany()
    console.log(`Found ${configs.length} survey configs to update`)
    
    for (const config of configs) {
      await prisma.surveyConfig.update({
        where: { id: config.id },
        data: { surveySetId: defaultSurveySet.id }
      })
    }
    
    // Update existing survey_responses records
    const responses = await prisma.surveyResponse.findMany()
    console.log(`Found ${responses.length} survey responses to update`)
    
    for (const response of responses) {
      await prisma.surveyResponse.update({
        where: { id: response.id },
        data: { surveySetId: defaultSurveySet.id }
      })
    }
    
    // Update existing survey_sections records
    const sections = await prisma.surveySection.findMany()
    console.log(`Found ${sections.length} survey sections to update`)
    
    for (const section of sections) {
      await prisma.surveySection.update({
        where: { id: section.id },
        data: { surveySetId: defaultSurveySet.id }
      })
    }
    
    // Update existing survey_questions records
    const questions = await prisma.surveyQuestion.findMany()
    console.log(`Found ${questions.length} survey questions to update`)
    
    for (const question of questions) {
      await prisma.surveyQuestion.update({
        where: { id: question.id },
        data: { surveySetId: defaultSurveySet.id }
      })
    }
    
    console.log('Migration completed successfully!')
    
  } catch (error) {
    console.error('Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateToSurveySets()
