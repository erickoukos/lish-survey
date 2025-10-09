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
  digitalSkillsNeeds: ["Data Analysis & Visualization"],
  digitalSkillsOther: "",
  professionalDevNeeds: ["Leadership & Management"],
  professionalDevOther: "",
  confidenceLevel: "Confident",
  facedUnsureSituation: false,
  unsureSituationDescription: "",
  observedIssues: ["None"],
  observedIssuesOther: "",
  knewReportingChannel: "Yes",
  trainingMethod: "Online/Remote",
  trainingMethodOther: "",
  refresherFrequency: "Every 6 months",
  prioritizedPolicies: ["Code of Conduct", "Anti-Discrimination Policy"],
  prioritizationReason: "Essential for workplace harmony",
  policyChallenges: ["Lack of Training", "Complex Procedures"],
  policyChallengesOther: "",
  complianceSuggestions: "More interactive training sessions",
  generalComments: "Test submission with proper validation"
};

async function testSubmit() {
  try {
    console.log('Testing submit API with proper validation...');
    console.log('Response data:', JSON.stringify(testResponse, null, 2));
    
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
      console.log('✅ Response submitted successfully!');
    } else {
      console.log('❌ Submit failed:', result);
    }
  } catch (error) {
    console.error('Error testing submit:', error);
  }
}

testSubmit();
