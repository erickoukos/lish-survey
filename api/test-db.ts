import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET'])
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Testing database connection...')
    console.log('DATABASE_URL available:', !!process.env.DATABASE_URL)
    console.log('NODE_ENV:', process.env.NODE_ENV)
    
    // Test basic connection
    await prisma.$connect()
    console.log('✅ Database connection successful')
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`
    console.log('✅ Database query successful:', result)
    
    // Test survey sets
    const surveySets = await prisma.surveySet.findMany()
    console.log('✅ Survey sets query successful:', surveySets.length, 'sets found')
    
    // Test responses
    const responses = await prisma.surveyResponse.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })
    console.log('✅ Responses query successful:', responses.length, 'responses found')
    
    return res.status(200).json({
      success: true,
      message: 'Database connection successful',
      data: {
        surveySets: surveySets.length,
        responses: responses.length,
        databaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
    
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    })
    
    return res.status(500).json({
      success: false,
      error: 'Database connection failed',
      details: {
        message: error.message,
        code: error.code,
        databaseUrl: !!process.env.DATABASE_URL,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } finally {
    await prisma.$disconnect()
  }
}
