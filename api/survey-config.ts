import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { z } from 'zod'

const surveyConfigSchema = z.object({
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
        // Get current survey configuration for the active survey set
        const activeSurveySet = await prisma.surveySet.findFirst({
          where: { isActive: true }
        })

        if (!activeSurveySet) {
          return res.status(404).json({
            success: false,
            error: 'No active survey set found'
          })
        }

        const config = await prisma.surveyConfig.findFirst({
          where: { surveySetId: activeSurveySet.id },
          orderBy: { createdAt: 'desc' }
        })

        if (!config) {
          // Create default configuration for the active survey set
          const startDate = new Date()
          const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          const defaultConfig = await prisma.surveyConfig.create({
            data: {
              surveySetId: activeSurveySet.id,
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
          return res.status(500).json({
            error: 'Database connection failed',
            message: 'Cannot connect to database',
            details: connectError instanceof Error ? connectError.message : 'Unknown connection error'
          })
        }
        
        // Check if SurveyConfig table exists by trying a simple query
        try {
          await prisma.surveyConfig.findFirst()
          console.log('SurveyConfig table exists and is accessible')
        } catch (tableError) {
          console.error('SurveyConfig table error:', tableError)
          return res.status(500).json({
            error: 'Database table not accessible',
            message: 'SurveyConfig table not accessible',
            details: tableError instanceof Error ? tableError.message : 'Unknown table error'
          })
        }
        
        // First, try to find existing config for the active survey set
        const activeSurveySet = await prisma.surveySet.findFirst({
          where: { isActive: true }
        })
        
        if (!activeSurveySet) {
          return res.status(404).json({
            error: 'No active survey set found',
            message: 'Cannot update configuration - no active survey set found',
            suggestion: 'Please create or activate a survey set first'
          })
        }
        
        console.log('Active survey set:', activeSurveySet.name, activeSurveySet.id)
        
        // Look for existing config for the active survey set
        const existingConfig = await prisma.surveyConfig.findFirst({
          where: { surveySetId: activeSurveySet.id }
        })
        console.log('Existing config found:', !!existingConfig)

        // Use the provided dates directly
        const startDate = new Date(data.startDate)
        const endDate = new Date(data.endDate)

        let config
        if (existingConfig) {
          console.log('Updating existing configuration...')
          // Update existing configuration
          const updateData: any = {
            isActive: data.isActive,
            startDate: startDate,
            endDate: endDate,
            title: data.title || 'Policy Awareness Survey',
            description: data.description
          }
          
          // Only update expectedResponses if it's provided and valid
          if (data.expectedResponses !== undefined && data.expectedResponses !== null) {
            updateData.expectedResponses = data.expectedResponses
          }
          
          config = await prisma.surveyConfig.update({
            where: { id: existingConfig.id },
            data: updateData
          })
          console.log('Configuration updated successfully')
        } else {
          console.log('Creating new configuration...')
          // Create new configuration
          const createData: any = {
            surveySetId: activeSurveySet.id,
            isActive: data.isActive,
            startDate: startDate,
            endDate: endDate,
            title: data.title || 'Policy Awareness Survey',
            description: data.description
          }
          
          // Only set expectedResponses if it's provided and valid
          if (data.expectedResponses !== undefined && data.expectedResponses !== null) {
            createData.expectedResponses = data.expectedResponses
          } else {
            createData.expectedResponses = 100 // Default only for new configs
          }
          
          config = await prisma.surveyConfig.create({
            data: createData
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
        
        // Check if it's a table not found error
        if (dbError instanceof Error && dbError.message.includes('table') && dbError.message.includes('does not exist')) {
          return res.status(500).json({
            error: 'Database schema issue',
            message: 'SurveyConfig table does not exist. Please run database migration.',
            details: 'The database tables need to be created. Please contact the administrator to run the database setup.',
            suggestion: 'Run: node scripts/setup-database-tables.js'
          })
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
        // Get the active survey set
        const activeSurveySet = await prisma.surveySet.findFirst({
          where: { isActive: true }
        })

        if (!activeSurveySet) {
          return res.status(404).json({
            error: 'No active survey set found',
            message: 'Cannot reset survey - no active survey set found'
          })
        }

        // Get count of existing responses before reset
        const responseCount = await prisma.surveyResponse.count({
          where: { surveySetId: activeSurveySet.id }
        })

        // Delete all responses for the active survey set
        await prisma.surveyResponse.deleteMany({
          where: { surveySetId: activeSurveySet.id }
        })

        // Reset survey configuration for the active survey set
        await prisma.surveyConfig.deleteMany({
          where: { surveySetId: activeSurveySet.id }
        })

        // Create new configuration for the active survey set
        const startDate = new Date()
        const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
        const defaultConfig = await prisma.surveyConfig.create({
          data: {
            surveySetId: activeSurveySet.id,
            isActive: true,
            startDate: startDate,
            endDate: endDate,
            title: 'Policy Awareness Survey',
            description: 'LISH AI LABS Policy Awareness & Training Needs Survey',
            expectedResponses: 100
          }
        })

        console.log(`Survey reset by admin ${payload.username}: Configuration reset for survey set "${activeSurveySet.name}", ${responseCount} responses deleted`)

        return res.status(200).json({
          success: true,
          message: `Survey configuration reset successfully. ${responseCount} responses were deleted from "${activeSurveySet.name}".`,
          config: defaultConfig,
          deletedResponses: responseCount,
          surveySet: activeSurveySet.name
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
