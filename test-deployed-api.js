const testResponse = {
  department: "Technical Team",
  awareness: {
    antiSocialBehavior: 4,
    antiDiscrimination: 3,
    sexualHarassment: 4,
    safeguarding: 3,
    hrPolicyManual: 4,
    codeOfConduct: 5,
    financeWellness: 3,
    workLifeBalance: 4,
    digitalWorkplace: 5,
    softSkills: 4,
    professionalism: 5
  },
  urgentTrainings: ["Anti-Social Behavior Policy", "Code of Conduct"],
  urgentTrainingsOther: "",
  financeWellnessNeeds: ["Financial Literacy Basics – Saving, spending, and tracking money smartly"],
  cultureWellnessNeeds: ["Stress management strategies for high-paced digital environments"],
  cultureWellnessOther: "",
  digitalSkillsNeeds: ["Cybersecurity Awareness"],
  digitalSkillsOther: "",
  professionalDevNeeds: ["Leadership Skills for Young Professionals"],
  professionalDevOther: "",
  confidenceLevel: "Confident",
  facedUnsureSituation: false,
  unsureSituationDescription: "",
  observedIssues: ["None of the above"],
  observedIssuesOther: "",
  knewReportingChannel: "Yes",
  trainingMethod: "In-person training sessions",
  trainingMethodOther: "",
  refresherFrequency: "1 training /Monthly",
  prioritizedPolicies: ["Code of Conduct", "Anti-Discrimination Policy"],
  prioritizationReason: "Essential for workplace harmony",
  policyChallenges: ["Policies are too complex or difficult to understand", "Lack of clear examples or case studies"],
  policyChallengesOther: "",
  complianceSuggestions: "More interactive training sessions",
  generalComments: "Test submission with correct validation"
};

async function testDeployedAPI() {
  try {
    console.log('Testing deployed API with database connection fixes...');
    
    const response = await fetch('https://lish-survey.vercel.app/api/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testResponse)
    });
    
    const result = await response.json();
    console.log('Submit test result:', result);
    console.log('Status:', response.status);
    
    if (response.ok) {
      if (result.warning) {
        console.log('⚠️ Response logged but database connection issue persists');
        console.log('Error details:', result.error);
      } else {
        console.log('✅ Response submitted successfully to database!');
      }
    } else {
      console.log('❌ Submit failed:', result);
    }
  } catch (error) {
    console.error('Error testing deployed API:', error);
  }
}

testDeployedAPI();
