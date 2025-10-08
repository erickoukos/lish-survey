import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../src/lib/prisma'
import { z } from 'zod'
import { handleCors } from '../src/lib/cors'

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
  // Handle CORS
  if (handleCors(req, res)) return

  if (req.method === 'GET') {
    try {
      const { active } = req.query
      
      // Check if SurveySection table exists by trying to access it
      let sections
      try {
        const where: any = {}
        if (active !== undefined) where.isActive = active === 'true'

        sections = await prisma.surveySection.findMany({
          where,
          orderBy: { order: 'asc' },
          include: {
            questions: {
              where: { isActive: true },
              orderBy: { questionNumber: 'asc' }
            }
          }
        })
        
        // If no sections found, return default sections
        if (sections.length === 0) {
          console.log('No sections found in database, returning default sections')
          sections = [
          {
            id: 'default-a',
            sectionKey: 'A',
            title: 'General Information',
            description: 'Basic demographic and department information',
            order: 1,
            isActive: true,
            questions: []
          },
          {
            id: 'default-b',
            sectionKey: 'B',
            title: 'Awareness & Understanding',
            description: 'Policy awareness and understanding levels',
            order: 2,
            isActive: true,
            questions: []
          },
          {
            id: 'default-c',
            sectionKey: 'C',
            title: 'Urgent Trainings',
            description: 'Immediate training needs and priorities',
            order: 3,
            isActive: true,
            questions: []
          },
          {
            id: 'default-d',
            sectionKey: 'D',
            title: 'Finance & Wellness',
            description: 'Financial wellness and literacy needs',
            order: 4,
            isActive: true,
            questions: []
          },
          {
            id: 'default-e',
            sectionKey: 'E',
            title: 'Culture & Wellness',
            description: 'Workplace culture and mental health needs',
            order: 5,
            isActive: true,
            questions: []
          },
          {
            id: 'default-f',
            sectionKey: 'F',
            title: 'Digital Skills',
            description: 'Digital literacy and technology skills',
            order: 6,
            isActive: true,
            questions: []
          },
          {
            id: 'default-g',
            sectionKey: 'G',
            title: 'Professional Development',
            description: 'Career development and soft skills needs',
            order: 7,
            isActive: true,
            questions: []
          },
          {
            id: 'default-h',
            sectionKey: 'H',
            title: 'Observed Issues',
            description: 'Workplace issues and concerns',
            order: 8,
            isActive: true,
            questions: []
          },
          {
            id: 'default-i',
            sectionKey: 'I',
            title: 'Training Methods',
            description: 'Preferred training delivery methods',
            order: 9,
            isActive: true,
            questions: []
          },
          {
            id: 'default-j',
            sectionKey: 'J',
            title: 'Final Questions',
            description: 'Additional feedback and suggestions',
            order: 10,
            isActive: true,
            questions: []
          }
        ]
        }
      }

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
      const section = await prisma.surveySection.findUnique({ where: { id } })
      if (!section) {
        return res.status(404).json({ success: false, error: 'Section not found' })
      }
      
      const questionsCount = await prisma.surveyQuestion.count({
        where: { section: section.sectionKey }
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
