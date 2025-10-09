import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { z } from 'zod'

const surveyConfigSchema = z.object({
  surveySetId: z.string().optional(),
  isActive: z.boolean(),
  startDate: z.string(),
  endDate: z.string(),
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
        // Get survey set ID from query params or use default
        const surveySetId = req.query.surveySetId as string || 'default'
        
        // First, try to find the survey set
        let surveySet = await prisma.surveySet.findUnique({
          where: { id: surveySetId }
        })

        // If survey set doesn't exist, create a default one
        if (!surveySet) {
          surveySet = await prisma.surveySet.create({
            data: {
              id: 'default',
              name: 'Default Survey',
              description: 'Default survey set for the application',
              isActive: true
            }
          })
        }

        // Get current survey configuration for this survey set
        const config = await prisma.surveyConfig.findFirst({
          where: { surveySetId: surveySet.id },
          orderBy: { createdAt: 'desc' }
        })

        if (!config) {
          // Create default configuration if none exists
          const startDate = new Date()
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          const defaultConfig = await prisma.surveyConfig.create({
            data: {
              id: 'default',
              surveySetId: surveySet.id,
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
      console.log('Request body:', JSON.stringify(req.body, null, 2))
      
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
        console.log('Expected schema:', surveyConfigSchema.shape)
        console.log('Received body:', JSON.stringify(req.body, null, 2))
        return res.status(400).json({
          error: 'Invalid request data',
          details: validationResult.error.errors,
          received: req.body
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
        
        // Get or create survey set
        const surveySetId = data.surveySetId || 'default'
        let surveySet = await prisma.surveySet.findUnique({
          where: { id: surveySetId }
        })

        if (!surveySet) {
          console.log('Survey set not found, looking for existing default...')
          // Try to find any existing survey set
          const existingSurveySet = await prisma.surveySet.findFirst({
            where: { isActive: true }
          })
          
          if (existingSurveySet) {
            console.log('Using existing survey set:', existingSurveySet.id)
            surveySet = existingSurveySet
          } else {
            console.log('Creating new survey set...')
            surveySet = await prisma.surveySet.create({
              data: {
                id: surveySetId,
                name: 'Default Survey',
                description: 'Default survey set for the application',
                isActive: true
              }
            })
          }
        }

        // First, try to find existing config
        console.log('Looking for existing config with surveySetId:', surveySet.id)
        const existingConfig = await prisma.surveyConfig.findFirst({
          where: { surveySetId: surveySet.id }
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
            where: { id: existingConfig.id },
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
              surveySetId: surveySet.id,
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
        console.error('Error stack:', dbError instanceof Error ? dbError.stack : 'No stack trace')
        
        // Try to disconnect from database
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          console.error('Error disconnecting from database:', disconnectError)
        }
        
        return res.status(500).json({
          error: 'Database error',
          message: 'Cannot update configuration - database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error',
          stack: dbError instanceof Error ? dbError.stack : undefined
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
        // Get survey set ID from query params or use default
        const surveySetId = req.query.surveySetId as string || 'default'
        
        // Get or create survey set
        let surveySet = await prisma.surveySet.findUnique({
          where: { id: surveySetId }
        })

        if (!surveySet) {
          surveySet = await prisma.surveySet.create({
            data: {
              id: 'default',
              name: 'Default Survey',
              description: 'Default survey set for the application',
              isActive: true
            }
          })
        }

        // Get count of existing responses before reset
        const responseCount = await prisma.surveyResponse.count({
          where: { surveySetId: surveySet.id }
        })

        // Create a new survey period for the reset
        const newSurveyPeriod = `survey_${Date.now()}`
        
        // Update all existing responses to mark them as from previous period
        await prisma.surveyResponse.updateMany({
          where: { 
            surveySetId: surveySet.id,
            surveyPeriod: 'default' 
          },
          data: { surveyPeriod: newSurveyPeriod }
        })

        // Reset survey configuration to default
        await prisma.surveyConfig.deleteMany({
          where: { surveySetId: surveySet.id }
        })

        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        const defaultConfig = await prisma.surveyConfig.create({
          data: {
            id: 'default',
            surveySetId: surveySet.id,
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
