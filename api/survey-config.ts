import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { z } from 'zod'

const surveyConfigSchema = z.object({
  isActive: z.boolean(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  title: z.string().optional(),
  description: z.string().optional()
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  try {
    if (req.method === 'GET') {
      try {
        // Get current survey configuration
        const config = await prisma.surveyConfig.findFirst({
          orderBy: { createdAt: 'desc' }
        })

        if (!config) {
          // Create default configuration if none exists
          const defaultConfig = await prisma.surveyConfig.create({
            data: {
              isActive: true,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              title: 'Policy Awareness Survey',
              description: 'LISH AI LABS Policy Awareness & Training Needs Survey'
            }
          })

          return res.status(200).json({
            success: true,
            config: defaultConfig
          })
        }

        return res.status(200).json({
          success: true,
          config
        })
      } catch (dbError) {
        console.error('Database error in survey-config GET:', dbError)
        
        // Return default configuration if database is not available
        const defaultConfig = {
          id: 'default',
          isActive: true,
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          title: 'Policy Awareness Survey',
          description: 'LISH AI LABS Policy Awareness & Training Needs Survey',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }

        return res.status(200).json({
          success: true,
          config: defaultConfig,
          warning: 'Using default configuration - database not available'
        })
      }
    }

    if (req.method === 'POST' || req.method === 'PUT') {
      // Update survey configuration (admin only)
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      const validationResult = surveyConfigSchema.safeParse(req.body)
      if (!validationResult.success) {
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        })
      }

      const data = validationResult.data

      try {
        // Update or create configuration
        const config = await prisma.surveyConfig.upsert({
          where: { id: 'default' },
          update: {
            isActive: data.isActive,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            title: data.title || 'Policy Awareness Survey',
            description: data.description
          },
          create: {
            id: 'default',
            isActive: data.isActive,
            startDate: new Date(data.startDate),
            endDate: new Date(data.endDate),
            title: data.title || 'Policy Awareness Survey',
            description: data.description
          }
        })

        console.log(`Survey configuration updated by admin ${payload.username}`)

        return res.status(200).json({
          success: true,
          config,
          message: 'Survey configuration updated successfully'
        })
      } catch (dbError) {
        console.error('Database error in survey-config POST/PUT:', dbError)
        return res.status(500).json({
          error: 'Database unavailable',
          message: 'Cannot update configuration - database not available'
        })
      }
    }

    if (req.method === 'DELETE') {
      // Reset all survey responses (admin only)
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      // Delete all survey responses
      const deleteResult = await prisma.surveyResponse.deleteMany({})
      
      // Reset survey configuration to default
      await prisma.surveyConfig.deleteMany({})
      
      const defaultConfig = await prisma.surveyConfig.create({
        data: {
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          title: 'Policy Awareness Survey',
          description: 'LISH AI LABS Policy Awareness & Training Needs Survey'
        }
      })

      console.log(`Survey reset by admin ${payload.username}: ${deleteResult.count} responses deleted`)

      return res.status(200).json({
        success: true,
        message: `Survey reset successfully. ${deleteResult.count} responses deleted.`,
        config: defaultConfig
      })
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Error in survey-config API:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process survey configuration request'
    })
  }
}
