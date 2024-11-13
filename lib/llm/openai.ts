import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
})

/**
 * Prints formatted debug information about a prompt execution
 */
export function printRunPrompts(
  promptInput: string | string[],
  prompt: string,
  output: string
): void {
  console.log(
    '=== START ======================================================='
  )
  console.log(
    '~~~ prompt_input    ----------------------------------------------'
  )
  console.log(promptInput, '\n')
  console.log(
    '~~~ prompt    ----------------------------------------------------'
  )
  console.log(prompt, '\n')
  console.log(
    '~~~ output    ----------------------------------------------------'
  )
  console.log(output, '\n')
  console.log(
    '=== END =========================================================='
  )
  console.log('\n\n\n')
}

/**
 * Generates a prompt by replacing placeholders in a template
 */
export async function generatePrompt(
  promptInput: string | string[],
  promptTemplate: string
): Promise<string> {
  const inputs = Array.isArray(promptInput) ? promptInput : [promptInput]
  let prompt = promptTemplate

  inputs.forEach((input, index) => {
    prompt = prompt.replace(`!<INPUT ${index}>!`, String(input))
  })

  if (prompt.includes('<commentblockmarker>###</commentblockmarker>')) {
    prompt = prompt.split('<commentblockmarker>###</commentblockmarker>')[1]
  }

  return prompt.trim()
}

/**
 * Makes a basic completion request to OpenAI
 */
export async function gptRequest(
  prompt: string,
  model: string = 'gpt-4o-mini',
  maxTokens: number = 1500
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7,
    })

    return response.choices[0].message.content || ''
  } catch (error) {
    console.error('Error in gptRequest:', error)
    return `GENERATION ERROR: ${error}`
  }
}

/**
 * Generates embeddings for given text using OpenAI's embedding models
 */
export async function getTextEmbedding(
  text: string,
  model: string = 'text-embedding-3-small'
): Promise<number[]> {
  if (!text?.trim()) {
    throw new Error('Input text must be a non-empty string.')
  }

  try {
    const cleanText = text.replace(/\n/g, ' ').trim()
    const response = await openai.embeddings.create({
      input: [cleanText],
      model: model,
    })

    return response.data[0].embedding
  } catch (error) {
    console.error('Error in getTextEmbedding:', error)
    throw error
  }
}
