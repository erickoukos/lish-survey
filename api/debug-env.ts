import { VercelRequest, VercelResponse } from '@vercel/node'
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
    console.log('=== Environment Debug ===')
    
    const envInfo = {
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        length: process.env.DATABASE_URL?.length || 0,
        startsWith: process.env.DATABASE_URL?.substring(0, 20) || 'N/A'
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      JWT_SECRET: {
        exists: !!process.env.JWT_SECRET,
        length: process.env.JWT_SECRET?.length || 0
      },
      // Check for alternative database URLs
      POSTGRES_URL: {
        exists: !!process.env.POSTGRES_URL,
        length: process.env.POSTGRES_URL?.length || 0
      },
      POSTGRES_PRISMA_URL: {
        exists: !!process.env.POSTGRES_PRISMA_URL,
        length: process.env.POSTGRES_PRISMA_URL?.length || 0
      }
    }
    
    console.log('Environment info:', JSON.stringify(envInfo, null, 2))
    
    return res.status(200).json({
      success: true,
      message: 'Environment debug info',
      data: envInfo
    })
    
  } catch (error) {
    console.error('❌ Environment debug failed:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Environment debug failed',
      details: error.message
    })
  }
}
