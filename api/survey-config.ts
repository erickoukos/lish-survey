import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { z } from 'zod'

const surveyConfigSchema = z.object({
  isActive: z.boolean(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  title: z.string().optional(),
  description: z.string().optional(),
  expectedResponses: z.number().min(1).optional()
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
          const startDate = new Date()
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          const defaultConfig = await prisma.surveyConfig.create({
            data: {
              isActive: true,
              startDate: startDate,
              endDate: endDate,
              title: 'Policy Awareness Survey',
              description: 'LISH AI LABS Policy Awareness & Training Needs Survey',
              expectedResponses: 100
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
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        const defaultConfig = {
          id: 'default',
          isActive: true,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
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
      console.log('Survey config update request received')
      
      // Update survey configuration (admin only)
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authentication required - no valid auth header')
        return res.status(401).json({ error: 'Authentication required' })
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      if (!payload) {
        console.log('Invalid token provided')
        return res.status(401).json({ error: 'Invalid token' })
      }

      console.log('Authentication successful for user:', payload.username)

      const validationResult = surveyConfigSchema.safeParse(req.body)
      if (!validationResult.success) {
        console.log('Validation failed:', validationResult.error.errors)
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors
        })
      }

      const data = validationResult.data
      console.log('Validation successful, data:', data)

      try {
        console.log('Attempting database operations...')
        
        // Test database connection first
        try {
          await prisma.$connect()
          console.log('Database connection successful')
        } catch (connectError) {
          console.error('Database connection failed:', connectError)
          throw connectError
        }
        
        // First, try to find existing config
        console.log('Looking for existing config with id: default')
        const existingConfig = await prisma.surveyConfig.findUnique({
          where: { id: 'default' }
        })
        console.log('Existing config found:', !!existingConfig)

        // Use the provided dates directly
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)

        let config
        if (existingConfig) {
          console.log('Updating existing configuration...')
          // Update existing configuration
          config = await prisma.surveyConfig.update({
            where: { id: 'default' },
            data: {
              isActive: data.isActive,
              startDate: startDate,
              endDate: endDate,
              title: data.title || 'Policy Awareness Survey',
              description: data.description,
              expectedResponses: data.expectedResponses || 100
            }
          })
          console.log('Configuration updated successfully')
        } else {
          console.log('Creating new configuration...')
          // Create new configuration
          config = await prisma.surveyConfig.create({
            data: {
              id: 'default',
              isActive: data.isActive,
              startDate: startDate,
              endDate: endDate,
              title: data.title || 'Policy Awareness Survey',
              description: data.description,
              expectedResponses: data.expectedResponses || 100
            }
          })
          console.log('Configuration created successfully')
        }

        console.log(`Survey configuration updated by admin ${payload.username}`)

        // Disconnect from database
        await prisma.$disconnect()
        console.log('Database disconnected')

        return res.status(200).json({
          success: true,
          config,
          message: 'Survey configuration updated successfully'
        })
      } catch (dbError) {
        console.error('Database error in survey-config POST/PUT:', dbError)
        console.error('Error details:', JSON.stringify(dbError, null, 2))
        
        // Try to disconnect from database
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          console.error('Error disconnecting from database:', disconnectError)
        }
        
        return res.status(500).json({
          error: 'Database unavailable',
          message: 'Cannot update configuration - database not available',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        })
      }
    }

    if (req.method === 'DELETE') {
      // Reset survey configuration but preserve responses (admin only)
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' })
      }

      try {
        // Get count of existing responses before reset
        const responseCount = await prisma.surveyResponse.count()

        // Create a new survey period for the reset
        const newSurveyPeriod = `survey_${Date.now()}`
        
        // Update all existing responses to mark them as from previous period
        await prisma.surveyResponse.updateMany({
          where: { surveyPeriod: 'default' },
          data: { surveyPeriod: newSurveyPeriod }
        })

        // Reset survey configuration to default
        await prisma.surveyConfig.deleteMany({})

        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        const defaultConfig = await prisma.surveyConfig.create({
          data: {
            id: 'default',
            isActive: true,
            startDate: startDate,
            endDate: endDate,
            title: 'Policy Awareness Survey',
            description: 'LISH AI LABS Policy Awareness & Training Needs Survey'
          }
        })

        console.log(`Survey reset by admin ${payload.username}: Configuration reset, ${responseCount} responses moved to period ${newSurveyPeriod}`)

        return res.status(200).json({
          success: true,
          message: `Survey configuration reset successfully. ${responseCount} previous responses preserved and accessible under period ${newSurveyPeriod}.`,
          config: defaultConfig,
          preservedResponses: responseCount,
          previousSurveyPeriod: newSurveyPeriod
        })
      } catch (dbError) {
        console.error('Database error in survey-config DELETE:', dbError)
        return res.status(500).json({
          error: 'Database unavailable',
          message: 'Cannot reset survey - database not available'
        })
      }
    }

    return res.status(405).json({ error: 'Method not allowed' })

  } catch (error) {
    console.error('Error in survey-config API:', error)
    console.error('Error details:', JSON.stringify(error, null, 2))
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process survey configuration request',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
