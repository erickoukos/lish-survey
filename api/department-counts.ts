import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'
import { verifyToken } from '../src/lib/auth'
import { handleCors } from '../src/lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log('Department counts API called:', req.method, req.url, new Date().toISOString())
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
      // Get all department counts
      const departmentCounts = await prisma.departmentCount.findMany({
        where: { isActive: true },
        orderBy: { department: 'asc' }
      })

      // Calculate total expected responses
      const totalExpected = departmentCounts.reduce((sum, dept) => sum + dept.staffCount, 0)

      return res.status(200).json({
        success: true,
        data: departmentCounts,
        totalExpected,
        count: departmentCounts.length
      })
    }

    if (req.method === 'POST') {
      // Create or update department counts
      const { departments } = req.body

      if (!Array.isArray(departments)) {
        return res.status(400).json({ error: 'Departments must be an array' })
      }

      // Validate department data
      for (const dept of departments) {
        if (!dept.department || typeof dept.staffCount !== 'number' || dept.staffCount < 0) {
          return res.status(400).json({ 
            error: 'Each department must have a name and non-negative staff count' 
          })
        }
      }

      // Clear existing counts and create new ones
      await prisma.departmentCount.updateMany({
        where: { isActive: true },
        data: { isActive: false }
      })

      const createdCounts = await prisma.departmentCount.createMany({
        data: departments.map(dept => ({
          department: dept.department,
          staffCount: dept.staffCount,
          isActive: true
        }))
      })

      // Calculate total expected responses
      const totalExpected = departments.reduce((sum, dept) => sum + dept.staffCount, 0)

      // Update survey config with new expected responses
      await prisma.surveyConfig.upsert({
        where: { id: 'default' },
        update: { expectedResponses: totalExpected },
        create: {
          id: 'default',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          title: 'Policy Awareness Survey',
          expectedResponses: totalExpected
        }
      })

      return res.status(200).json({
        success: true,
        message: `Updated ${createdCounts.count} department counts`,
        totalExpected,
        data: departments
      })
    }

    if (req.method === 'PUT') {
      // Update specific department count
      const { id, staffCount } = req.body

      if (!id || typeof staffCount !== 'number' || staffCount < 0) {
        return res.status(400).json({ 
          error: 'Valid ID and non-negative staff count required' 
        })
      }

      const updatedCount = await prisma.departmentCount.update({
        where: { id },
        data: { staffCount }
      })

      // Recalculate total expected responses
      const allCounts = await prisma.departmentCount.findMany({
        where: { isActive: true }
      })
      const totalExpected = allCounts.reduce((sum, dept) => sum + dept.staffCount, 0)

      // Update survey config
      await prisma.surveyConfig.upsert({
        where: { id: 'default' },
        update: { expectedResponses: totalExpected },
        create: {
          id: 'default',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          title: 'Policy Awareness Survey',
          expectedResponses: totalExpected
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Department count updated successfully',
        data: updatedCount,
        totalExpected
      })
    }

    if (req.method === 'DELETE') {
      // Delete department count
      const { id } = req.body

      if (!id) {
        return res.status(400).json({ error: 'Department ID required' })
      }

      await prisma.departmentCount.update({
        where: { id },
        data: { isActive: false }
      })

      // Recalculate total expected responses
      const allCounts = await prisma.departmentCount.findMany({
        where: { isActive: true }
      })
      const totalExpected = allCounts.reduce((sum, dept) => sum + dept.staffCount, 0)

      // Update survey config
      await prisma.surveyConfig.upsert({
        where: { id: 'default' },
        update: { expectedResponses: totalExpected },
        create: {
          id: 'default',
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          title: 'Policy Awareness Survey',
          expectedResponses: totalExpected
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Department count deleted successfully',
        totalExpected
      })
    }

  } catch (error) {
    console.error('Department counts API error:', error)
    return res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to process department counts'
    })
  }
}
