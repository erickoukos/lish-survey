const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🔄 Setting up database tables...');
  
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Check if tables exist by trying to query them
    const tables = [
      'SurveySet',
      'SurveyResponse', 
      'SurveyConfig',
      'SurveySection',
      'SurveyQuestion',
      'AdminUser',
      'DepartmentCount'
    ];
    
    for (const table of tables) {
      try {
        const count = await prisma[table.toLowerCase()].count();
        console.log(`✅ Table ${table} exists (${count} records)`);
      } catch (error) {
        console.log(`❌ Table ${table} does not exist or has issues:`, error.message);
      }
    }
    
    // Create default survey set if it doesn't exist
    try {
      let surveySet = await prisma.surveySet.findFirst({
        where: { isActive: true }
      });
      
      if (!surveySet) {
        surveySet = await prisma.surveySet.create({
          data: {
            name: 'Default Survey Set',
            description: 'Default survey set for responses',
            isActive: true
          }
        });
        console.log('✅ Created default survey set');
      } else {
        console.log('✅ Default survey set already exists');
      }
    } catch (error) {
      console.log('❌ Error with survey set:', error.message);
    }
    
    // Create default admin user if it doesn't exist
    try {
      let adminUser = await prisma.adminUser.findFirst({
        where: { username: 'admin' }
      });
      
      if (!adminUser) {
        adminUser = await prisma.adminUser.create({
          data: {
            username: 'admin',
            password: 'admin123', // In production, this should be hashed
            email: 'admin@example.com',
            isActive: true
          }
        });
        console.log('✅ Created default admin user');
      } else {
        console.log('✅ Default admin user already exists');
      }
    } catch (error) {
      console.log('❌ Error with admin user:', error.message);
    }
    
    // Create default survey config if it doesn't exist
    try {
      let surveyConfig = await prisma.surveyConfig.findFirst();
      
      if (!surveyConfig) {
        const surveySet = await prisma.surveySet.findFirst({
          where: { isActive: true }
        });
        
        if (surveySet) {
          surveyConfig = await prisma.surveyConfig.create({
            data: {
              id: 'default',
              surveySetId: surveySet.id,
              isActive: true,
              startDate: new Date(),
              endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
              title: 'Policy Awareness Survey',
              description: 'Employee policy awareness and training needs survey',
              expectedResponses: 145
            }
          });
          console.log('✅ Created default survey config');
        } else {
          console.log('❌ No active survey set found for config');
        }
      } else {
        console.log('✅ Default survey config already exists');
      }
    } catch (error) {
      console.log('❌ Error with survey config:', error.message);
    }
    
    console.log('🎉 Database setup completed!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the setup
setupDatabase().catch(console.error);
