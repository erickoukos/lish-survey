const { PrismaClient } = require('@prisma/client');

async function testLocalDatabase() {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });

  try {
    console.log('Testing local database connection...');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test a simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query successful:', result);
    
    // Test survey sets
    const surveySets = await prisma.surveySet.findMany();
    console.log('✅ Survey sets found:', surveySets.length);
    
    // Test creating a response
    const testResponse = await prisma.surveyResponse.create({
      data: {
        surveyPeriod: 'default',
        surveySetId: surveySets[0]?.id || 'default',
        department: 'Technical Team',
        awareness: JSON.stringify({ test: 1 }),
        urgentTrainings: JSON.stringify(['Test']),
        urgentTrainingsOther: '',
        financeWellnessNeeds: JSON.stringify([]),
        cultureWellnessNeeds: JSON.stringify([]),
        cultureWellnessOther: '',
        digitalSkillsNeeds: JSON.stringify([]),
        digitalSkillsOther: '',
        professionalDevNeeds: JSON.stringify([]),
        professionalDevOther: '',
        confidenceLevel: 'Confident',
        facedUnsureSituation: false,
        unsureSituationDescription: '',
        observedIssues: JSON.stringify(['None of the above']),
        observedIssuesOther: '',
        knewReportingChannel: 'Yes',
        trainingMethod: 'In-person training sessions',
        trainingMethodOther: '',
        refresherFrequency: '1 training /Monthly',
        prioritizedPolicies: JSON.stringify(['Code of Conduct']),
        prioritizationReason: 'Test',
        policyChallenges: JSON.stringify(['Policies are too complex or difficult to understand']),
        policyChallengesOther: '',
        complianceSuggestions: 'Test',
        generalComments: 'Test response'
      }
    });
    
    console.log('✅ Test response created:', testResponse.id);
    
    // Clean up test response
    await prisma.surveyResponse.delete({
      where: { id: testResponse.id }
    });
    console.log('✅ Test response cleaned up');
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Error details:', {
      code: error.code,
      meta: error.meta
    });
  } finally {
    await prisma.$disconnect();
  }
}

testLocalDatabase();
