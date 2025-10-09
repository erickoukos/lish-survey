const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const departments = [
  { name: 'Head of Department (HODs)', count: 7 },
  { name: 'Data Annotation Team', count: 70 },
  { name: 'HR & Administration Department', count: 3 },
  { name: 'Project Management Department', count: 1 },
  { name: 'Security Department', count: 4 },
  { name: 'Technical Team', count: 54 },
  { name: 'Digital Marketing Department', count: 5 },
  { name: 'Finance & Accounting Department', count: 1 },
  { name: 'Sanitation Department', count: 2 }
];

async function fixDepartments() {
  try {
    console.log('=== Fixing Department Counts ===');
    
    // Delete existing department counts
    await prisma.departmentCount.deleteMany();
    console.log('Deleted existing department counts');
    
    // Create new department counts
    for (const dept of departments) {
      await prisma.departmentCount.create({
        data: {
          department: dept.name,
          staffCount: dept.count,
          isActive: true
        }
      });
      console.log(`Created: ${dept.name} - ${dept.count} staff`);
    }
    
    // Verify the fix
    const totalCount = await prisma.departmentCount.aggregate({
      _sum: { staffCount: true }
    });
    
    console.log(`Total staff count: ${totalCount._sum.staffCount}`);
    
  } catch (error) {
    console.error('Error fixing departments:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDepartments();
