import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'

export default async function (req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  
  if (req.method === 'GET') {
    try {
      // Test database connection
      await prisma.$connect()
      const responseCount = await prisma.surveyResponse.count()
      await prisma.$disconnect()
      
      return res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: true,
          responseCount
        }
      })
    } catch (error) {
      console.error('Database health check failed:', error)
      return res.status(200).json({ 
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: {
          connected: false,
          error: error.message
        }
      })
    }
  }
  return res.status(405).json({ error: 'Method Not Allowed' })
}
