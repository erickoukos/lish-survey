const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestResponse() {
  try {
    console.log('=== Creating Test Response ===');
    
    // Get the active survey set
    const activeSurveySet = await prisma.surveySet.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Active survey set:', activeSurveySet?.id);
    
    // Create a test response
    const response = await prisma.surveyResponse.create({
      data: {
        surveyPeriod: 'default',
        surveySetId: activeSurveySet?.id || 'default',
        department: 'Technical Team',
        awareness: JSON.stringify({
          "Data Protection Policy": "Very Aware",
          "Information Security Policy": "Aware",
          "Code of Conduct": "Very Aware"
        }),
        urgentTrainings: JSON.stringify(["Data Protection", "Information Security"]),
        urgentTrainingsOther: "",
        financeWellnessNeeds: JSON.stringify(["Budget Management"]),
        cultureWellnessNeeds: JSON.stringify(["Team Building"]),
        cultureWellnessOther: "",
        digitalSkillsNeeds: JSON.stringify(["Data Analysis"]),
        digitalSkillsOther: "",
        professionalDevNeeds: JSON.stringify(["Leadership"]),
        professionalDevOther: "",
        prioritizedPolicies: JSON.stringify(["Data Protection Policy", "Information Security Policy"]),
        policyChallenges: JSON.stringify(["Lack of Training", "Complex Procedures"]),
        policyChallengesOther: "",
        confidenceLevel: "Confident",
        facedUnsureSituation: false,
        unsureSituationDescription: "",
        observedIssues: JSON.stringify(["None"]),
        observedIssuesOther: "",
        knewReportingChannel: "Yes",
        reportingChannelDescription: "HR Department",
        additionalComments: "Test submission"
      }
    });
    
    console.log('✅ Test response created:', response.id);
    console.log('Department:', response.department);
    console.log('Survey Set ID:', response.surveySetId);
    console.log('Survey Period:', response.surveyPeriod);
    
  } catch (error) {
    console.error('Error creating test response:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestResponse();
