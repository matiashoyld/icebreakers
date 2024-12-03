import OpenAI from 'openai'

export async function callLLM(prompt: string): Promise<{ score: number }> {
  const apiKey = process.env.OPENAI_API_KEY

  const openai = new OpenAI({
    apiKey: apiKey,
  })

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 4096,
    temperature: 0.7,
  })

  const output = response.choices[0].message.content || ''

  return { score: parseFloat(output) || 0 } // Convert string to number, default to 0 if parsing fails
}
