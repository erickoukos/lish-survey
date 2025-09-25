#!/usr/bin/env node

const axios = require('axios')

const BASE_URL = process.env.API_URL || 'http://localhost:5000'

async function testAPI() {
  console.log('🧪 Testing API endpoints...\n')

  try {
    // Test health check
    console.log('1. Testing health check...')
    const healthResponse = await axios.get(`${BASE_URL}/health`)
    console.log('✅ Health check passed:', healthResponse.data)

    // Test login
    console.log('\n2. Testing admin login...')
    const loginResponse = await axios.post(`${BASE_URL}/api/login`, {
      username: 'admin',
      password: 'lish2025'
    })
    console.log('✅ Login successful')
    const token = loginResponse.data.token

    // Test survey submission
    console.log('\n3. Testing survey submission...')
    const surveyData = {
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
      urgentTrainings: ['Anti-Social Behavior Policy'],
      confidenceLevel: 'Confident',
      facedUnsureSituation: false,
      knewReportingChannel: 'Yes',
      trainingMethod: 'In-person training sessions',
      refresherFrequency: '1 training /Monthly'
    }

    const submitResponse = await axios.post(`${BASE_URL}/api/submit`, surveyData)
    console.log('✅ Survey submission successful:', submitResponse.data)

    // Test getting responses
    console.log('\n4. Testing get responses...')
    const responsesResponse = await axios.get(`${BASE_URL}/api/responses`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    console.log('✅ Get responses successful:', responsesResponse.data.pagination)

    // Test export
    console.log('\n5. Testing CSV export...')
    const exportResponse = await axios.get(`${BASE_URL}/api/export`, {
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'stream'
    })
    console.log('✅ CSV export successful')

    console.log('\n🎉 All API tests passed!')

  } catch (error) {
    console.error('❌ API test failed:', error.response?.data || error.message)
    process.exit(1)
  }
}

testAPI()
