import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  // Set CORS headers
  Object.entries(handleCors(req, res) ? {} : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing database connection...')
    
    // Test database connection
    await prisma.$connect()
    console.log('Database connected successfully')
    
    // Test a simple query
    const responseCount = await prisma.surveyResponse.count()
    console.log(`Database query successful. Response count: ${responseCount}`)
    
    // Test creating a test record
    const testResponse = await prisma.surveyResponse.create({
      data: {
        department: 'Test Department',
        awareness: JSON.stringify({ test: 1 }),
        urgentTrainings: JSON.stringify(['Test Training']),
        financeWellnessNeeds: JSON.stringify([]),
        cultureWellnessNeeds: JSON.stringify([]),
        digitalSkillsNeeds: JSON.stringify([]),
        professionalDevNeeds: JSON.stringify([]),
        confidenceLevel: 'Neutral',
        facedUnsureSituation: false,
        observedIssues: JSON.stringify([]),
        knewReportingChannel: 'Yes',
        trainingMethod: 'In-person training sessions',
        refresherFrequency: '1 training /Monthly',
        prioritizedPolicies: JSON.stringify(['Test Policy']),
        prioritizationReason: 'Test reason',
        policyChallenges: JSON.stringify(['Test challenge']),
        complianceSuggestions: 'Test suggestion',
        generalComments: 'Test comment'
      }
    })
    
    console.log('Test record created successfully:', testResponse.id)
    
    // Clean up test record
    await prisma.surveyResponse.delete({
      where: { id: testResponse.id }
    })
    
    console.log('Test record cleaned up')
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      responseCount,
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('Database health check failed:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      message: error.message,
      timestamp: new Date().toISOString()
    })
  } finally {
    await prisma.$disconnect()
  }
}
