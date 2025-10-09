const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== Checking Database ===');
    
    // Check survey sets
    const surveySets = await prisma.surveySet.findMany();
    console.log('Survey Sets:', surveySets.length);
    surveySets.forEach(set => {
      console.log(`- ${set.id}: ${set.name} (Active: ${set.isActive})`);
    });
    
    // Check survey configs
    const configs = await prisma.surveyConfig.findMany();
    console.log('Survey Configs:', configs.length);
    configs.forEach(config => {
      console.log(`- ${config.id}: ${config.title} (Active: ${config.isActive}, SurveySet: ${config.surveySetId})`);
    });
    
    // Check responses
    const responses = await prisma.surveyResponse.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' }
    });
    console.log('Responses:', responses.length);
    responses.forEach(response => {
      console.log(`- ${response.id}: ${response.department} (SurveySet: ${response.surveySetId}, Period: ${response.surveyPeriod})`);
    });
    
    // Check department counts
    const deptCounts = await prisma.departmentCount.findMany();
    console.log('Department Counts:', deptCounts.length);
    deptCounts.forEach(dept => {
      console.log(`- ${dept.departmentName}: ${dept.staffCount} (Active: ${dept.isActive})`);
    });
    
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
