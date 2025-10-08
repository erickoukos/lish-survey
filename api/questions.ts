import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../src/lib/prisma'
import { z } from 'zod'
import { cors } from '../src/lib/cors'

// Validation schemas
const questionSchema = z.object({
  section: z.string().min(1),
  questionType: z.enum(['text', 'select', 'multiselect', 'rating', 'boolean']),
  questionText: z.string().min(1),
  questionNumber: z.number().int().positive(),
  isRequired: z.boolean().default(true),
  options: z.array(z.string()).optional(),
  validationRules: z.object({
    minLength: z.number().optional(),
    maxLength: z.number().optional(),
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional()
  }).optional(),
  placeholder: z.string().optional(),
  helpText: z.string().optional(),
  isActive: z.boolean().default(true)
})

const sectionSchema = z.object({
  sectionKey: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional(),
  order: z.number().int().positive(),
  isActive: z.boolean().default(true)
})

// GET /api/questions - Get all questions
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await cors(req, res)

  if (req.method === 'GET') {
    try {
      const { section, active } = req.query
      
      // Check if SurveyQuestion table exists by trying to access it
      let questions
      try {
        const where: any = {}
        if (section) where.section = section
        if (active !== undefined) where.isActive = active === 'true'

        questions = await prisma.surveyQuestion.findMany({
          where,
          orderBy: [
            { section: 'asc' },
            { questionNumber: 'asc' }
          ]
        })
      } catch (tableError) {
        // If table doesn't exist, return empty array
        console.log('SurveyQuestion table not found, returning empty questions array')
        questions = []
      }

      res.status(200).json({ success: true, data: questions })
    } catch (error) {
      console.error('Error fetching questions:', error)
      res.status(500).json({ success: false, error: 'Failed to fetch questions' })
    }
  }

  // POST /api/questions - Create new question
  else if (req.method === 'POST') {
    try {
      const data = questionSchema.parse(req.body)
      
      // Check if SurveyQuestion table exists
      try {
        // Check if question number already exists in section
        const existingQuestion = await prisma.surveyQuestion.findUnique({
          where: {
            section_questionNumber: {
              section: data.section,
              questionNumber: data.questionNumber
            }
          }
        })

        if (existingQuestion) {
          return res.status(400).json({ 
            success: false, 
            error: 'Question number already exists in this section' 
          })
        }

        const question = await prisma.surveyQuestion.create({
          data: {
            ...data,
            options: data.options ? JSON.stringify(data.options) : null,
            validationRules: data.validationRules ? JSON.stringify(data.validationRules) : null
          }
        })

        res.status(201).json({ success: true, data: question })
      } catch (tableError) {
        return res.status(503).json({ 
          success: false, 
          error: 'Question management not available. Please run database migration first.' 
        })
      }
    } catch (error) {
      console.error('Error creating question:', error)
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors })
      }
      res.status(500).json({ success: false, error: 'Failed to create question' })
    }
  }

  // PUT /api/questions - Update question
  else if (req.method === 'PUT') {
    try {
      const { id, ...data } = req.body
      
      if (!id) {
        return res.status(400).json({ success: false, error: 'Question ID is required' })
      }

      const validatedData = questionSchema.partial().parse(data)
      
      // Check if question number already exists in section (if being updated)
      if (validatedData.section && validatedData.questionNumber) {
        const existingQuestion = await prisma.surveyQuestion.findFirst({
          where: {
            section: validatedData.section,
            questionNumber: validatedData.questionNumber,
            id: { not: id }
          }
        })

        if (existingQuestion) {
          return res.status(400).json({ 
            success: false, 
            error: 'Question number already exists in this section' 
          })
        }
      }

      const question = await prisma.surveyQuestion.update({
        where: { id },
        data: {
          ...validatedData,
          options: validatedData.options ? JSON.stringify(validatedData.options) : undefined,
          validationRules: validatedData.validationRules ? JSON.stringify(validatedData.validationRules) : undefined
        }
      })

      res.status(200).json({ success: true, data: question })
    } catch (error) {
      console.error('Error updating question:', error)
      if (error instanceof z.ZodError) {
        return res.status(400).json({ success: false, error: 'Invalid data', details: error.errors })
      }
      res.status(500).json({ success: false, error: 'Failed to update question' })
    }
  }

  // DELETE /api/questions - Delete question
  else if (req.method === 'DELETE') {
    try {
      const { id } = req.query
      
      if (!id || typeof id !== 'string') {
        return res.status(400).json({ success: false, error: 'Question ID is required' })
      }

      await prisma.surveyQuestion.delete({
        where: { id }
      })

      res.status(200).json({ success: true, message: 'Question deleted successfully' })
    } catch (error) {
      console.error('Error deleting question:', error)
      res.status(500).json({ success: false, error: 'Failed to delete question' })
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE'])
    res.status(405).json({ success: false, error: 'Method not allowed' })
  }
}
