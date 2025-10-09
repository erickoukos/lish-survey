const { PrismaClient } = require('@prisma/client');

async function testDatabaseConnection() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Test survey sets
    const surveySets = await prisma.surveySet.findMany();
    console.log('✅ Survey sets query successful:', surveySets.length, 'sets found');
    
    // Test responses
    const responses = await prisma.surveyResponse.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    });
    console.log('✅ Responses query successful:', responses.length, 'responses found');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Error details:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();
