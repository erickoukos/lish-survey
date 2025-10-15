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

  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Force database setup requested')

    if (req.method === 'GET') {
      // Check current database status
      const status = {
        databaseConnected: false,
        tablesExist: {
          SurveySet: false,
          SurveyResponse: false,
          SurveyConfig: false,
          SurveySection: false,
          SurveyQuestion: false,
          AdminUser: false,
          DepartmentCount: false
        },
        errors: [] as string[]
      }

      try {
        // Test database connection
        await prisma.$connect()
        status.databaseConnected = true
        console.log('Database connection successful')

        // Test each table
        const tables = [
          'SurveySet', 'SurveyResponse', 'SurveyConfig', 
          'SurveySection', 'SurveyQuestion', 'AdminUser', 'DepartmentCount'
        ]

        for (const table of tables) {
          try {
            const count = await prisma[table.toLowerCase()].count()
            status.tablesExist[table as keyof typeof status.tablesExist] = true
            console.log(`Table ${table} exists (${count} records)`)
          } catch (error) {
            const errorMsg = `Table ${table} error: ${error instanceof Error ? error.message : 'Unknown error'}`
            status.errors.push(errorMsg)
            console.error(errorMsg)
          }
        }

        await prisma.$disconnect()

        return res.status(200).json({
          success: true,
          status,
          message: 'Database status checked'
        })

      } catch (error) {
        status.errors.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
        console.error('Database connection failed:', error)

        return res.status(200).json({
          success: false,
          status,
          message: 'Database connection failed'
        })
      }
    }

    if (req.method === 'POST') {
      console.log('Starting force database setup...')
      
      try {
        // Connect to database
        await prisma.$connect()
        console.log('Database connected')

        // Create default survey set
        let surveySet
        try {
          surveySet = await prisma.surveySet.findFirst({
            where: { isActive: true }
          })
          
          if (!surveySet) {
            surveySet = await prisma.surveySet.create({
              data: {
                name: 'Default Survey Set',
                description: 'Default survey set for responses',
                isActive: true
              }
            })
            console.log('Created default survey set')
          } else {
            console.log('Default survey set already exists')
          }
        } catch (error) {
          console.error('Error with survey set:', error)
          throw error
        }

        // Create default admin user
        try {
          let adminUser = await prisma.adminUser.findFirst({
            where: { username: 'admin' }
          })
          
          if (!adminUser) {
            adminUser = await prisma.adminUser.create({
              data: {
                username: 'admin',
                password: 'admin123', // In production, this should be hashed
                email: 'admin@example.com',
                isActive: true
              }
            })
            console.log('Created default admin user')
          } else {
            console.log('Default admin user already exists')
          }
        } catch (error) {
          console.error('Error with admin user:', error)
          throw error
        }

        // Create default survey config
        try {
          let surveyConfig = await prisma.surveyConfig.findFirst()
          
          if (!surveyConfig) {
            surveyConfig = await prisma.surveyConfig.create({
              data: {
                id: 'default',
                isActive: true,
                startDate: new Date(),
                endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
                title: 'Policy Awareness Survey',
                description: 'LISH AI LABS Policy Awareness & Training Needs Survey',
                expectedResponses: 147 // Total: 7+54+70+5+3+1+1+2+4 = 147
              }
            })
            console.log('Created default survey config')
          } else {
            console.log('Default survey config already exists')
          }
        } catch (error) {
          console.error('Error with survey config:', error)
          throw error
        }

        // Create default department counts with correct LISH AI LABS structure
        try {
          const existingCounts = await prisma.departmentCount.findMany({
            where: { isActive: true }
          })
          
          if (existingCounts.length === 0) {
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

            await prisma.departmentCount.createMany({
              data: lishDepartments.map(dept => ({
                department: dept.department,
                staffCount: dept.staffCount,
                isActive: true
              }))
            })
            console.log('Created LISH AI LABS department counts')
          } else {
            console.log('Department counts already exist')
          }
        } catch (error) {
          console.error('Error with department counts:', error)
          throw error
        }

        await prisma.$disconnect()
        console.log('Database setup completed successfully')

        return res.status(200).json({
          success: true,
          message: 'Database setup completed successfully',
          details: {
            surveySet: 'Created or verified',
            adminUser: 'Created or verified',
            surveyConfig: 'Created or verified',
            departmentCounts: 'Created or verified'
          }
        })

      } catch (error) {
        console.error('Force database setup failed:', error)
        
        try {
          await prisma.$disconnect()
        } catch (disconnectError) {
          console.error('Error disconnecting:', disconnectError)
        }

        return res.status(500).json({
          success: false,
          error: 'Database setup failed',
          message: error instanceof Error ? error.message : 'Unknown error',
          suggestion: 'The database tables may not exist. Please run: npx prisma db push --accept-data-loss'
        })
      }
    }

  } catch (error) {
    console.error('Force database setup API error:', error)
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}
