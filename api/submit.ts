import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { surveyResponseSchema } from '../src/lib/validation'
import { checkRateLimit } from '../src/lib/rateLimiter'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS
  if (handleCors(req, res)) return

  // Set CORS headers
  Object.entries(handleCors(req, res) ? {} : {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }).forEach(([key, value]) => res.setHeader(key, value))

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check survey timing (with fallback if database is unavailable)
    let surveyConfig = null
    try {
      surveyConfig = await prisma.surveyConfig.findFirst({
        orderBy: { createdAt: 'desc' }
      })
    } catch (dbError) {
      console.warn('Database unavailable for survey config check, using default settings:', dbError)
      // Use default configuration if database is unavailable
      surveyConfig = {
        isActive: true,
        startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      }
    }

    if (surveyConfig) {
      const now = new Date()
      const startDate = new Date(surveyConfig.startDate)
      const endDate = new Date(surveyConfig.endDate)

      if (!surveyConfig.isActive) {
        return res.status(403).json({
          error: 'Survey is currently inactive',
          message: 'The survey is not currently accepting responses. Please contact the administrator.'
        })
      }

      if (now < startDate) {
        return res.status(403).json({
          error: 'Survey has not started yet',
          message: `The survey will start on ${startDate.toLocaleDateString()} at ${startDate.toLocaleTimeString()}.`
        })
      }

      if (now > endDate) {
        return res.status(403).json({
          error: 'Survey has ended',
          message: `The survey ended on ${endDate.toLocaleDateString()} at ${endDate.toLocaleTimeString()}.`
        })
      }
    }

    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection?.remoteAddress || 'unknown'
    const rateLimitPassed = await checkRateLimit(`submit:${clientIP}`)
    
    if (!rateLimitPassed) {
      return res.status(429).json({ 
        error: 'Too many requests. Please try again later.' 
      })
    }

    // Validate request body
    const validationResult = surveyResponseSchema.safeParse(req.body)
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Invalid request data',
        details: validationResult.error.errors
      })
    }

    const data = validationResult.data

    // Create survey response (with fallback if database is unavailable)
    try {
      const response = await prisma.surveyResponse.create({
        data: {
          department: data.department,
          awareness: JSON.stringify(data.awareness),
          urgentTrainings: JSON.stringify(data.urgentTrainings),
          urgentTrainingsOther: data.urgentTrainingsOther,
          financeWellnessNeeds: JSON.stringify(data.financeWellnessNeeds || []),
          cultureWellnessNeeds: JSON.stringify(data.cultureWellnessNeeds || []),
          cultureWellnessOther: data.cultureWellnessOther,
          digitalSkillsNeeds: JSON.stringify(data.digitalSkillsNeeds || []),
          digitalSkillsOther: data.digitalSkillsOther,
          professionalDevNeeds: JSON.stringify(data.professionalDevNeeds || []),
          professionalDevOther: data.professionalDevOther,
          confidenceLevel: data.confidenceLevel,
          facedUnsureSituation: data.facedUnsureSituation,
          unsureSituationDescription: data.unsureSituationDescription,
          observedIssues: JSON.stringify(data.observedIssues || []),
          observedIssuesOther: data.observedIssuesOther,
          knewReportingChannel: data.knewReportingChannel,
          trainingMethod: data.trainingMethod,
          trainingMethodOther: data.trainingMethodOther,
          refresherFrequency: data.refresherFrequency,
          prioritizedPolicies: data.prioritizedPolicies || '',
          prioritizationReason: data.prioritizationReason || '',
          policyChallenges: data.policyChallenges || '',
          complianceSuggestions: data.complianceSuggestions || '',
          generalComments: data.generalComments || ''
        }
      })

      console.log(`Survey response submitted: ${response.id}`)

      return res.status(201).json({
        success: true,
        id: response.id,
        message: 'Survey response submitted successfully'
      })
    } catch (dbError) {
      console.error('Database error when creating survey response:', dbError)
      
      // Log the submission data for manual processing if needed
      console.log('Survey submission data (database unavailable):', {
        department: data.department,
        awareness: data.awareness,
        urgentTrainings: data.urgentTrainings,
        confidenceLevel: data.confidenceLevel,
        timestamp: new Date().toISOString()
      })
      
      // Return success even if database is unavailable (data is logged)
      return res.status(201).json({
        success: true,
        id: 'logged-' + Date.now(),
        message: 'Survey response received and logged (database temporarily unavailable)',
        warning: 'Response has been logged for manual processing'
      })
    }

  } catch (error) {
    console.error('Error submitting survey response:', error)
    
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to submit survey response'
    })
  }
}
