import dotenv from 'dotenv';		

dotenv.config();

export async function callLLM(prompt: string): Promise<{ score: number }> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('API key is not set in the environment');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4', // Specify the model you want to use
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to call LLM API');
  }

  const data = await response.json();
  return { score: data.choices[0].message.content }; // Adjust according to your API response structure 
}
