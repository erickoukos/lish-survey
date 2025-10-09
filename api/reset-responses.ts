import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Reset responses API called:', req.method, req.url, new Date().toISOString())
  
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
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

    const { surveySetId, confirmReset } = req.body

    if (!surveySetId) {
      return res.status(400).json({ error: 'Survey set ID is required' })
    }

    if (!confirmReset) {
      return res.status(400).json({ error: 'Please confirm the reset by setting confirmReset to true' })
    }

    // Check if survey set exists
    const surveySet = await prisma.surveySet.findUnique({
      where: { id: surveySetId }
    })

    if (!surveySet) {
      return res.status(404).json({ error: 'Survey set not found' })
    }

    // Get count of responses to be deleted
    const responseCount = await prisma.surveyResponse.count({
      where: { surveySetId }
    })

    if (responseCount === 0) {
      return res.status(200).json({
        success: true,
        message: 'No responses found for this survey set',
        deletedCount: 0
      })
    }

    // Delete all responses for the survey set
    await prisma.surveyResponse.deleteMany({
      where: { surveySetId }
    })

    return res.status(200).json({
      success: true,
      message: `Successfully reset ${responseCount} responses for survey set "${surveySet.name}"`,
      deletedCount: responseCount,
      surveySetName: surveySet.name
    })

  } catch (error) {
    console.error('Reset responses API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to reset responses'
    })
  }
}
