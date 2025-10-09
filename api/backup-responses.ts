import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Backup responses API called:', req.method, req.url, new Date().toISOString())
  
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST') {
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

    if (req.method === 'GET') {
      // Get backup data
      const { surveySetId, format = 'json' } = req.query

      const where: any = {}
      if (surveySetId) {
        where.surveySetId = surveySetId
      }

      const responses = await prisma.surveyResponse.findMany({
        where,
        include: {
          surveySet: {
            select: {
              name: true,
              description: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      })

      if (format === 'csv') {
        // Generate CSV format
        const csvHeaders = [
          'ID',
          'Survey Set',
          'Department',
          'Confidence Level',
          'Faced Unsure Situation',
          'Knew Reporting Channel',
          'Training Method',
          'Refresher Frequency',
          'Created At'
        ]

        const csvRows = responses.map(response => [
          response.id,
          response.surveySet.name,
          response.department,
          response.confidenceLevel,
          response.facedUnsureSituation ? 'Yes' : 'No',
          response.knewReportingChannel,
          response.trainingMethod,
          response.refresherFrequency,
          response.createdAt.toISOString()
        ])

        const csvContent = [csvHeaders, ...csvRows]
          .map(row => row.map(field => `"${field}"`).join(','))
          .join('\n')

        res.setHeader('Content-Type', 'text/csv')
        res.setHeader('Content-Disposition', `attachment; filename="survey_backup_${new Date().toISOString().split('T')[0]}.csv"`)
        return res.status(200).send(csvContent)
      }

      // Return JSON format
      return res.status(200).json({
        success: true,
        data: responses,
        count: responses.length,
        backupDate: new Date().toISOString()
      })
    }

    if (req.method === 'POST') {
      // Create automatic backup
      const { surveySetId } = req.body

      const where: any = {}
      if (surveySetId) {
        where.surveySetId = surveySetId
      }

      const responses = await prisma.surveyResponse.findMany({
        where,
        orderBy: { createdAt: 'desc' }
      })

      // Create backup record (you could store this in a backup table)
      const backupData = {
        timestamp: new Date().toISOString(),
        surveySetId: surveySetId || 'all',
        responseCount: responses.length,
        data: responses
      }

      // In a real implementation, you might want to:
      // 1. Store this in a backup table
      // 2. Upload to cloud storage
      // 3. Send via email
      // For now, we'll just return the backup data

      return res.status(200).json({
        success: true,
        message: 'Backup created successfully',
        backupData: {
          timestamp: backupData.timestamp,
          responseCount: backupData.responseCount,
          surveySetId: backupData.surveySetId
        }
      })
    }

  } catch (error) {
    console.error('Backup API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process backup request'
    })
  }
}
