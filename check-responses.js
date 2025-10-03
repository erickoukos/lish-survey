const { PrismaClient } = require('@prisma/client');

async function checkResponses() {
  const prisma = new PrismaClient();
  
  try {
    const count = await prisma.surveyResponse.count();
    console.log('Total responses:', count);
    
    if (count > 0) {
      const responses = await prisma.surveyResponse.findMany({ 
        take: 5, 
        orderBy: { createdAt: 'desc' } 
      });
      console.log('Recent responses:');
      responses.forEach((r, i) => {
        console.log(`${i + 1}. ID: ${r.id}, Department: ${r.department}, Created: ${r.createdAt}`);
      });
    }
  } catch (error) {
    console.error('Database error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkResponses();
