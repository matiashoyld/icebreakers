export async function callLLM(prompt: string): Promise<{ score: number }> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer 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`, 
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