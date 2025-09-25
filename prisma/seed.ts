import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample survey responses for testing
  const sampleResponses = [
    {
      department: 'Technical Team',
      awareness: {
        antiSocialBehavior: 4,
        antiDiscrimination: 5,
        sexualHarassment: 3,
        safeguarding: 4,
        hrPolicyManual: 2,
        codeOfConduct: 4,
        financeWellness: 3,
        workLifeBalance: 4,
        digitalWorkplace: 5,
        softSkills: 3,
        professionalism: 4
      },
      urgentTrainings: ['Anti-Social Behavior Policy', 'HR Policy Manual'],
      financeWellnessNeeds: ['Financial Literacy Basics – Saving, spending, and tracking money smartly'],
      cultureWellnessNeeds: ['Stress management strategies for high-paced digital environments'],
      digitalSkillsNeeds: ['Cybersecurity Awareness'],
      professionalDevNeeds: ['Effective Communication'],
      confidenceLevel: 'Confident',
      facedUnsureSituation: true,
      unsureSituationDescription: 'Not sure about reporting procedures',
      observedIssues: ['None of the above'],
      knewReportingChannel: 'Yes',
      trainingMethod: 'In-person training sessions',
      refresherFrequency: '1 training /Monthly',
      prioritizedPolicies: 'Anti-discrimination and harassment policies',
      prioritizationReason: 'These are most critical for workplace safety',
      policyChallenges: 'Complex language in policy documents',
      complianceSuggestions: 'More interactive training sessions',
      generalComments: 'Great initiative!'
    },
    {
      department: 'HR & Administration Department',
      awareness: {
        antiSocialBehavior: 5,
        antiDiscrimination: 5,
        sexualHarassment: 5,
        safeguarding: 5,
        hrPolicyManual: 5,
        codeOfConduct: 5,
        financeWellness: 4,
        workLifeBalance: 4,
        digitalWorkplace: 4,
        softSkills: 5,
        professionalism: 5
      },
      urgentTrainings: ['Finance & Financial Wellness'],
      financeWellnessNeeds: ['Investment & Savings Options – youth-friendly investment paths like SACCOs, money markets, and digital assets'],
      cultureWellnessNeeds: ['Resilience & Adaptability Training'],
      digitalSkillsNeeds: ['Responsible AI & Ethical Tech Use'],
      professionalDevNeeds: ['Leadership Skills for Young Professionals'],
      confidenceLevel: 'Very confident',
      facedUnsureSituation: false,
      observedIssues: ['None of the above'],
      knewReportingChannel: 'Yes',
      trainingMethod: 'Self-paced e-learning modules',
      refresherFrequency: '2 trainings /Month',
      prioritizedPolicies: 'All policies are important',
      prioritizationReason: 'Comprehensive approach needed',
      policyChallenges: 'Keeping policies updated',
      complianceSuggestions: 'Regular policy reviews',
      generalComments: 'Excellent survey design'
    }
  ]

  // Clear existing data
  await prisma.surveyResponse.deleteMany()
  console.log('🗑️  Cleared existing data')

  // Insert sample data
  for (const response of sampleResponses) {
    await prisma.surveyResponse.create({
      data: response
    })
  }

  console.log(`✅ Created ${sampleResponses.length} sample responses`)
  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
