// Test admin API with valid token
const testLogin = async () => {
  try {
    // Login first
    const loginResponse = await fetch('https://lish-survey-rbkg4jfau-lish-ai-labs.vercel.app/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'lish2025' })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.success);
    
    if (loginData.success) {
      // Test responses API
      const responsesResponse = await fetch('https://lish-survey-rbkg4jfau-lish-ai-labs.vercel.app/api/responses', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const responsesData = await responsesResponse.json();
      console.log('Responses API response:', JSON.stringify(responsesData, null, 2));
    }
  } catch (error) {
    console.error('Error testing admin API:', error);
  }
};

testLogin();
