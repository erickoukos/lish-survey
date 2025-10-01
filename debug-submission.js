const axios = require('axios')

const API_BASE_URL = 'https://lish-survey-rbkg4jfau-lish-ai-labs.vercel.app'

async function debugSubmission() {
  try {
    console.log('🔍 Debugging survey submission...')
    
    // Create test data that matches what the frontend sends
    const testData = {
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
      urgentTrainings: ['Anti-Social Behavior Policy', 'Sexual and Other forms of harassment Policy'],
      confidenceLevel: 'Confident',
      facedUnsureSituation: false,
      knewReportingChannel: 'Yes',
      trainingMethod: 'In-person training sessions',
      refresherFrequency: '1 training /Monthly',
      // Section J data - with workaround for current API
      prioritizedPolicies: 'Anti-Discrimination Policy, Code of Conduct',
      prioritizationReason: 'These policies are most critical for workplace safety',
      policyChallenges: 'Policies are too complex or difficult to understand, Language barriers or technical jargon',
      policyChallengesOther: '',
      complianceSuggestions: 'Implement regular training sessions',
      generalComments: 'Great initiative'
    }
    
    console.log('📤 Sending data:')
    console.log('  - prioritizedPolicies:', testData.prioritizedPolicies, '(type:', typeof testData.prioritizedPolicies, ', isArray:', Array.isArray(testData.prioritizedPolicies), ')')
    console.log('  - policyChallenges:', testData.policyChallenges, '(type:', typeof testData.policyChallenges, ', isArray:', Array.isArray(testData.policyChallenges), ')')
    console.log('  - urgentTrainings:', testData.urgentTrainings, '(type:', typeof testData.urgentTrainings, ', isArray:', Array.isArray(testData.urgentTrainings), ')')
    
    const response = await axios.post(`${API_BASE_URL}/api/submit`, testData)
    console.log('✅ Submission successful:', response.data)
    
  } catch (error) {
    console.error('❌ Submission failed:')
    console.error('Status:', error.response?.status)
    console.error('Error:', error.response?.data)
    
    if (error.response?.data?.details) {
      console.error('\n🔍 Validation Error Details:')
      error.response.data.details.forEach((detail, index) => {
        console.error(`  ${index + 1}. Path: ${detail.path.join('.')}`)
        console.error(`     Code: ${detail.code}`)
        console.error(`     Message: ${detail.message}`)
        if (detail.received !== undefined) {
          console.error(`     Received: ${JSON.stringify(detail.received)}`)
        }
        if (detail.expected) {
          console.error(`     Expected: ${detail.expected}`)
        }
        console.error('')
      })
    }
  }
}

debugSubmission()
