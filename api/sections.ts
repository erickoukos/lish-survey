import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../src/lib/prisma'
import { z } from 'zod'
import { cors } from '../src/lib/cors'

// Validation schema
const sectionSchema = z.object({
  sectionKey: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().positive(),
  isActive: z.boolean().default(true)
})

// GET /api/sections - Get all sections
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res)

  if (req.method === 'GET') {
    try {
      const { active } = req.query
      
      const where: any = {}
      if (active !== undefined) where.isActive = active === 'true'

      const sections = await prisma.surveySection.findMany({
        where,
        orderBy: { order: 'asc' },
        include: {
          questions: {
            where: { isActive: true },
            orderBy: { questionNumber: 'asc' }
          }
        }
      })

      res.status(200).json({ success: true, data: sections })
    } catch (error) {
      console.error('Error fetching sections:', error)
      res.status(500).json({ success: false, error: 'Failed to fetch sections' })
    }
  }

  // POST /api/sections - Create new section
  else if (req.method === 'POST') {
    try {
      const data = sectionSchema.parse(req.body)
      
      // Check if section key already exists
      const existingSection = await prisma.surveySection.findUnique({
        where: { sectionKey: data.sectionKey }
      })

      if (existingSection) {
        return res.status(400).json({ 
          success: false, 
          error: 'Section key already exists' 
        })
      }

      const section = await prisma.surveySection.create({
        data
      })

      res.status(201).json({ success: true, data: section })
    } catch (error) {
      console.error('Error creating section:', error)
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors })
      }
      res.status(500).json({ success: false, error: 'Failed to create section' })
    }
  }

  // PUT /api/sections - Update section
  else if (req.method === 'PUT') {
    try {
      const { id, ...data } = req.body
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Section ID is required' })
      }

      const validatedData = sectionSchema.partial().parse(data)
      
      // Check if section key already exists (if being updated)
      if (validatedData.sectionKey) {
        const existingSection = await prisma.surveySection.findFirst({
          where: {
            sectionKey: validatedData.sectionKey,
            id: { not: id }
          }
        })

        if (existingSection) {
          return res.status(400).json({ 
            success: false, 
            error: 'Section key already exists' 
          })
        }
      }

      const section = await prisma.surveySection.update({
        where: { id },
        data: validatedData
      })

      res.status(200).json({ success: true, data: section })
    } catch (error) {
      console.error('Error updating section:', error)
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors })
      }
      res.status(500).json({ success: false, error: 'Failed to update section' })
    }
  }

  // DELETE /api/sections - Delete section
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Section ID is required' })
      }

      // Check if section has questions
      const questionsCount = await prisma.surveyQuestion.count({
        where: { section: { in: await prisma.surveySection.findUnique({ where: { id } }).then(s => s ? [s.sectionKey] : []) } }
      })

      if (questionsCount > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'Cannot delete section with existing questions' 
        })
      }

      await prisma.surveySection.delete({
        where: { id }
      })

      res.status(200).json({ success: true, message: 'Section deleted successfully' })
    } catch (error) {
      console.error('Error deleting section:', error)
      res.status(500).json({ success: false, error: 'Failed to delete section' })
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
