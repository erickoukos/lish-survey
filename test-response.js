const testResponse = {
  department: "Technical Team",
  awareness: {
    "Data Protection Policy": "Very Aware",
    "Information Security Policy": "Aware",
    "Code of Conduct": "Very Aware"
  },
  urgentTrainings: ["Data Protection", "Information Security"],
  urgentTrainingsOther: "",
  financeWellnessNeeds: ["Budget Management"],
  cultureWellnessNeeds: ["Team Building"],
  cultureWellnessOther: "",
  digitalSkillsNeeds: ["Data Analysis"],
  digitalSkillsOther: "",
  professionalDevNeeds: ["Leadership"],
  professionalDevOther: "",
  prioritizedPolicies: ["Data Protection Policy", "Information Security Policy"],
  policyChallenges: ["Lack of Training", "Complex Procedures"],
  policyChallengesOther: "",
  confidenceLevel: "Confident",
  additionalComments: "Test submission"
};

async function testSubmit() {
  try {
    console.log('Testing submit API...');
    const response = await fetch('http://localhost:3000/api/submit', {
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
