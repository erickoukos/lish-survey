import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Survey sets API called:', req.method, req.url, new Date().toISOString())
  
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Check authentication for all operations except GET
    if (req.method !== 'GET') {
      const authHeader = req.headers.authorization
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authentication required' })
      }

      const token = authHeader.substring(7)
      const payload = verifyToken(token)
      
      if (!payload) {
        return res.status(401).json({ error: 'Invalid token' })
      }
    }

    if (req.method === 'GET') {
      // Get all survey sets
      const surveySets = await prisma.surveySet.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              responses: true,
              sections: true,
              questions: true
            }
          }
        }
      })

      return res.status(200).json({
        success: true,
        data: surveySets,
        count: surveySets.length
      })
    }

    if (req.method === 'POST') {
      // Create new survey set
      const { name, description } = req.body

      if (!name || typeof name !== 'string' || name.trim().length === 0) {
        return res.status(400).json({ error: 'Survey set name is required' })
      }

      // Check if name already exists
      const existingSet = await prisma.surveySet.findUnique({
        where: { name: name.trim() }
      })

      if (existingSet) {
        return res.status(400).json({ error: 'Survey set with this name already exists' })
      }

      const surveySet = await prisma.surveySet.create({
        data: {
          name: name.trim(),
          description: description?.trim() || null,
          isActive: true
        }
      })

      // Create default sections for the new survey set
      const defaultSections = [
        { sectionKey: 'A', title: 'General Information', description: 'Basic demographic and department information', order: 1 },
        { sectionKey: 'B', title: 'Awareness & Understanding', description: 'Policy awareness and understanding levels', order: 2 },
        { sectionKey: 'C', title: 'Urgent Trainings', description: 'Immediate training needs and priorities', order: 3 },
        { sectionKey: 'D', title: 'Finance & Wellness', description: 'Financial wellness and literacy needs', order: 4 },
        { sectionKey: 'E', title: 'Culture & Wellness', description: 'Workplace culture and mental health needs', order: 5 },
        { sectionKey: 'F', title: 'Digital Skills', description: 'Digital literacy and technology skills', order: 6 },
        { sectionKey: 'G', title: 'Professional Development', description: 'Career development and soft skills needs', order: 7 },
        { sectionKey: 'H', title: 'Observed Issues', description: 'Workplace issues and concerns', order: 8 },
        { sectionKey: 'I', title: 'Training Methods', description: 'Preferred training delivery methods', order: 9 },
        { sectionKey: 'J', title: 'Final Questions', description: 'Additional feedback and suggestions', order: 10 }
      ]

      for (const section of defaultSections) {
        await prisma.surveySection.create({
          data: {
            ...section,
            surveySetId: surveySet.id,
            isActive: true
          }
        })
      }

      // Create default survey config for the new survey set
      await prisma.surveyConfig.create({
        data: {
          id: `config-${surveySet.id}`,
          surveySetId: surveySet.id,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          title: `${name} Survey`,
          expectedResponses: 100
        }
      })

      return res.status(201).json({
        success: true,
        message: 'Survey set created successfully',
        data: surveySet
      })
    }

    if (req.method === 'PUT') {
      // Update survey set
      const { id, name, description, isActive } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Survey set ID is required' })
      }

      const updateData: any = {}
      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim().length === 0) {
          return res.status(400).json({ error: 'Survey set name must be a non-empty string' })
        }
        updateData.name = name.trim()
      }
      if (description !== undefined) {
        updateData.description = description?.trim() || null
      }
      if (isActive !== undefined) {
        updateData.isActive = Boolean(isActive)
        
        // If setting this survey set as active, deactivate all others
        if (isActive === true) {
          await prisma.surveySet.updateMany({
            where: { 
              id: { not: id },
              isActive: true 
            },
            data: { isActive: false }
          })
        }
      }

      const surveySet = await prisma.surveySet.update({
        where: { id },
        data: updateData
      })

      return res.status(200).json({
        success: true,
        message: 'Survey set updated successfully',
        data: surveySet
      })
    }

    if (req.method === 'DELETE') {
      // Delete survey set
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Survey set ID is required' })
      }

      // Check if survey set has responses
      const responseCount = await prisma.surveyResponse.count({
        where: { surveySetId: id }
      })

      if (responseCount > 0) {
        return res.status(400).json({ 
          error: 'Cannot delete survey set with existing responses. Please delete responses first or deactivate the survey set instead.' 
        })
      }

      // Delete related data
      await prisma.surveyQuestion.deleteMany({
        where: { surveySetId: id }
      })

      await prisma.surveySection.deleteMany({
        where: { surveySetId: id }
      })

      await prisma.surveyConfig.deleteMany({
        where: { surveySetId: id }
      })

      await prisma.surveySet.delete({
        where: { id }
      })

      return res.status(200).json({
        success: true,
        message: 'Survey set deleted successfully'
      })
    }

  } catch (error) {
    console.error('Survey sets API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process survey sets request'
    })
  }
}
