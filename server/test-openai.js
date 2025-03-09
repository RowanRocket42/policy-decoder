require('dotenv').config();
const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

async function testOpenAI() {
  try {
    console.log('Testing OpenAI API...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello, are you working?' }
      ],
      max_tokens: 50,
    });
    console.log('API Response:', completion.choices[0].message.content);
    console.log('API is working!');
  } catch (error) {
    console.error('Error testing OpenAI API:', error);
  }
}

// Test the chat endpoint directly
async function testChatEndpoint() {
  try {
    console.log('Testing chat endpoint with mock policy...');
    
    // Create a mock policy in memory
    const policyStorage = {};
    const policyId = 'test-policy-' + Date.now();
    
    policyStorage[policyId] = {
      name: 'Test Policy',
      type: 'Home Insurance',
      covered: ['Fire damage', 'Theft'],
      notCovered: ['Flood damage', 'Earthquake damage'],
      limits: ['$500 deductible', 'Maximum coverage: $500,000'],
      contact: {
        phone: '555-123-4567',
        email: 'support@testpolicy.com',
        website: 'www.testpolicy.com'
      }
    };
    
    // Create a prompt similar to the one in the chat endpoint
    const question = 'What is covered by this policy?';
    const policyData = policyStorage[policyId];
    
    const prompt = `
      I have the following insurance policy data:
      
      Policy Name: ${policyData.name}
      Policy Type: ${policyData.type}
      
      What's Covered:
      ${policyData.covered.map(item => `- ${item}`).join('\n')}
      
      What's Not Covered:
      ${policyData.notCovered.map(item => `- ${item}`).join('\n')}
      
      Limits & Conditions:
      ${policyData.limits.map(item => `- ${item}`).join('\n')}
      
      Contact Information:
      - Phone: ${policyData.contact.phone}
      - Email: ${policyData.contact.email}
      - Website: ${policyData.contact.website}
      
      Based on this policy information, please answer the following question:
      ${question}
      
      Please provide a concise and accurate answer based only on the information provided about this policy.
      If the information needed to answer the question is not available in the policy data, please state that clearly.
    `;
    
    // Call the OpenAI API with the same parameters as the chat endpoint
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { 
          role: 'system', 
          content: 'You are a helpful insurance assistant that answers questions about insurance policies. Provide accurate, concise answers based only on the policy information provided.' 
        },
        { role: 'user', content: prompt }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });
    
    // Extract and log the answer
    const answer = completion.choices[0].message.content;
    console.log('Chat Response:', answer);
    console.log('Chat endpoint simulation is working!');
  } catch (error) {
    console.error('Error testing chat endpoint:', error);
  }
}

// Run both tests
async function runTests() {
  await testOpenAI();
  console.log('\n-----------------------------------\n');
  await testChatEndpoint();
}

runTests(); 