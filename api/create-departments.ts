import { VercelRequest, VercelResponse } from '@vercel/node'
import { prisma } from '../src/lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Creating LISH AI LABS departments...')
    
    // Connect to database
    await prisma.$connect()
    console.log('Database connected')

    // Clear existing department counts
    await prisma.departmentCount.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })
    console.log('Cleared existing department counts')

    // Create LISH AI LABS departments
    const lishDepartments = [
      { department: 'Head of Department (HODs)', staffCount: 7 },
      { department: 'Technical Team', staffCount: 54 },
      { department: 'Data Annotation Team', staffCount: 70 },
      { department: 'Digital Marketing Department', staffCount: 5 },
      { department: 'HR & Administration Department', staffCount: 3 },
      { department: 'Finance & Accounting Department', staffCount: 1 },
      { department: 'Project Management Department', staffCount: 1 },
      { department: 'Sanitation Department', staffCount: 2 },
      { department: 'Security Department', staffCount: 4 }
    ]

    const createdDepartments = await prisma.departmentCount.createMany({
      data: lishDepartments.map(dept => ({
        department: dept.department,
        staffCount: dept.staffCount,
        isActive: true
      }))
    })

    console.log(`Created ${createdDepartments.count} departments`)

    // Update survey config with correct expected responses
    const totalExpected = lishDepartments.reduce((sum, dept) => sum + dept.staffCount, 0)
    
    await prisma.surveyConfig.upsert({
      where: { id: 'default' },
      update: { expectedResponses: totalExpected },
      create: {
        id: 'default',
        isActive: true,
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        title: 'Policy Awareness Survey',
        description: 'LISH AI LABS Policy Awareness & Training Needs Survey',
        expectedResponses: totalExpected
      }
    })

    console.log(`Updated survey config with ${totalExpected} expected responses`)

    await prisma.$disconnect()
    console.log('Database disconnected')

    return res.status(200).json({
      success: true,
      message: 'LISH AI LABS departments created successfully',
      departments: lishDepartments,
      totalExpected,
      createdCount: createdDepartments.count
    })

  } catch (error) {
    console.error('Error creating departments:', error)
    
    try {
      await prisma.$disconnect()
    } catch (disconnectError) {
      console.error('Error disconnecting:', disconnectError)
    }

    return res.status(500).json({
      success: false,
      error: 'Failed to create departments',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
