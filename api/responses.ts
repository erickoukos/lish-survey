import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  // Set CORS headers
  Object.entries(handleCors(req, res) ? {} : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  }).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    const token = authHeader.substring(7)
    const payload = verifyToken(token)
    
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    // Parse query parameters
    const page = parseInt(req.query.page as string) || 1
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100)
    const department = req.query.department as string
    const surveyPeriod = req.query.surveyPeriod as string || 'default'
    const skip = (page - 1) * limit

    try {
      // Build where clause
      const where: any = {
        surveyPeriod: surveyPeriod
      }
      if (department && department !== 'all') {
        where.department = department
      }

      // Get total count
      const totalCount = await prisma.surveyResponse.count({ where })

      // Get responses with pagination
      const responses = await prisma.surveyResponse.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      })

      // Calculate pagination info
      const totalPages = Math.ceil(totalCount / limit)
      const hasNextPage = page < totalPages
      const hasPrevPage = page > 1

      console.log(`Admin ${payload.username} accessed responses: page ${page}, ${responses.length} results`)

      return res.status(200).json({
        success: true,
        data: responses,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      })
    } catch (dbError) {
      console.error('Database error in responses API:', dbError)
      console.error('Database error details:', {
        message: dbError.message,
        code: dbError.code,
        meta: dbError.meta
      })
      
      // Return empty response if database is not available
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          page: 1,
          limit: 10,
          totalCount: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPrevPage: false
        },
        warning: 'Database not available - no responses to display',
        error: {
          message: dbError.message,
          code: dbError.code
        }
      })
    }

  } catch (error) {
    console.error('Error in responses API:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process responses request'
    })
  }
}
