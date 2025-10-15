const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function linkSectionsToSurveySet() {
  try {
    console.log('🔗 Linking sections to survey set...')

    // Get the default survey set
    const defaultSurveySet = await prisma.surveySet.findFirst({
      where: { name: 'LISH AI LABS Policy Survey' }
    })

    if (!defaultSurveySet) {
      console.log('❌ Default survey set not found')
      return
    }

    console.log(`📊 Found survey set: ${defaultSurveySet.name}`)

    // Get all sections that need to be linked
    const allSections = await prisma.surveySection.findMany()
    console.log(`📊 Found ${allSections.length} sections`)

    // Update sections to link to the default survey set
    if (allSections.length > 0) {
      console.log('🔗 Linking sections to survey set...')
      
      for (const section of allSections) {
        await prisma.surveySection.update({
          where: { id: section.id },
          data: { surveySetId: defaultSurveySet.id }
        })
      }
      
      console.log(`✅ Linked ${allSections.length} sections to survey set`)
    }

    // Verify the results
    const linkedSections = await prisma.surveySection.count({
      where: { surveySetId: defaultSurveySet.id }
    })
    
    const linkedQuestions = await prisma.surveyQuestion.count({
      where: { surveySetId: defaultSurveySet.id }
    })

    console.log('')
    console.log('🎉 Sections linked successfully!')
    console.log(`📊 Survey Set: ${defaultSurveySet.name}`)
    console.log(`📋 Sections: ${linkedSections}`)
    console.log(`❓ Questions: ${linkedQuestions}`)

  } catch (error) {
    console.error('❌ Error linking sections:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
linkSectionsToSurveySet()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })
