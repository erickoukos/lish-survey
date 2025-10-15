const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function setupDepartments() {
  try {
    console.log('Setting up LISH AI LABS departments...')
    
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
    
    // Create a default survey set if none exists
    let surveySet = await prisma.surveySet.findFirst({
      where: { isActive: true }
    })
    
    if (!surveySet) {
      surveySet = await prisma.surveySet.create({
        data: {
          name: 'LISH AI LABS Policy Survey',
          description: 'Policy awareness survey for LISH AI LABS staff',
          isActive: true
        }
      })
      console.log('Created default survey set')
    }
    
    // Create survey config if none exists
    let surveyConfig = await prisma.surveyConfig.findFirst({
      where: { surveySetId: surveySet.id }
    })
    
    if (!surveyConfig) {
      const totalExpected = lishDepartments.reduce((sum, dept) => sum + dept.staffCount, 0)
      surveyConfig = await prisma.surveyConfig.create({
        data: {
          surveySetId: surveySet.id,
          isActive: true,
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          title: 'LISH AI LABS Policy Awareness Survey',
          description: 'Comprehensive policy awareness survey for all LISH AI LABS staff',
          expectedResponses: totalExpected
        }
      })
      console.log('Created survey config')
    }
    
    console.log('Department setup completed successfully!')
    console.log('Total expected responses:', lishDepartments.reduce((sum, dept) => sum + dept.staffCount, 0))
    
  } catch (error) {
    console.error('Error setting up departments:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

setupDepartments()
  .then(() => {
    console.log('Setup completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Setup failed:', error)
    process.exit(1)
  })
