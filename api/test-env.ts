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
    console.log('Testing environment variables...')
    
    const envVars = {
      DATABASE_URL: !!process.env.DATABASE_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      VERCEL_ENV: process.env.VERCEL_ENV,
      // Don't log actual values for security
      DATABASE_URL_LENGTH: process.env.DATABASE_URL?.length || 0,
      JWT_SECRET: !!process.env.JWT_SECRET,
      JWT_SECRET_LENGTH: process.env.JWT_SECRET?.length || 0
    }
    
    console.log('Environment variables:', envVars)
    
    return res.status(200).json({
      success: true,
      message: 'Environment variables test',
      data: envVars
    })
    
  } catch (error) {
    console.error('❌ Environment test failed:', error)
    
    return res.status(500).json({
      success: false,
      error: 'Environment test failed',
      details: error.message
    })
  }
}
