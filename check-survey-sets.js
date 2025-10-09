const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSurveySets() {
  try {
    const surveySets = await prisma.surveySet.findMany();
    console.log('Existing survey sets:', surveySets);
    
    // Check if there's already a default survey set with different ID
    const defaultSurveySet = surveySets.find(s => s.name === 'Default Survey');
    if (defaultSurveySet && defaultSurveySet.id !== 'default') {
      console.log('Found existing Default Survey with ID:', defaultSurveySet.id);
      // We can't update the ID directly, so let's create a new one with the correct ID
      try {
        await prisma.surveySet.create({
          data: {
            id: 'default',
            name: 'Default Survey Set',
            description: 'Default survey set for the application',
            isActive: true
          }
        });
        console.log('Created new default survey set');
      } catch (createError) {
        console.log('Could not create new survey set:', createError.message);
      }
    } else if (!defaultSurveySet) {
      console.log('No default survey set found, creating one...');
      try {
        await prisma.surveySet.create({
          data: {
            id: 'default',
            name: 'Default Survey Set',
            description: 'Default survey set for the application',
            isActive: true
          }
        });
        console.log('Created default survey set');
      } catch (createError) {
        console.log('Could not create survey set:', createError.message);
      }
    } else {
      console.log('Default survey set already exists with correct ID');
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSurveySets();
