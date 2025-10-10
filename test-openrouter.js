const axios = require('axios');

// Test the OpenRouter API key
async function testOpenRouterAPI() {
  const apiKey = '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';
  
  console.log('🔑 Testing OpenRouter API Key...');
  console.log('Key:', apiKey.substring(0, 20) + '...');
  
  try {
    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'user', content: 'Hello! Please respond with "API key is working!" if you can read this.' }
      ],
      max_tokens: 50,
      temperature: 0.7,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    console.log('✅ SUCCESS: API Key is working!');
    console.log('Response:', response.data.choices[0]?.message?.content);
    console.log('Status:', response.status);
    
  } catch (error) {
    console.log('❌ ERROR: API Key is not working');
    console.log('Error:', error.response?.status, error.response?.statusText);
    console.log('Message:', error.response?.data?.error?.message || error.message);
    
    if (error.response?.status === 401) {
      console.log('🔐 This is an authentication error - the API key is invalid or expired');
    } else if (error.response?.status === 429) {
      console.log('⏰ Rate limit exceeded - API key works but you hit the limit');
    } else if (error.response?.status === 402) {
      console.log('💳 Payment required - API key works but account needs credits');
    }
  }
}

testOpenRouterAPI();
