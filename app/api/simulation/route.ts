import { generatePrompt } from '@/lib/llm/openai'
import { extractFirstJsonDict } from '@/lib/utils/json-parsers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Move client initialization inside the handler
async function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured in environment variables')
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

export async function POST(request: Request) {
  try {
    const openai = await getOpenAIClient()

    const body = await request.json()
    const { currentParticipantId, promptInputs, prompt } = body as {
      currentParticipantId: number
      promptInputs: string[]
      prompt: string
    }

    // Use the provided prompt instead of TURN_PROMPT
    const filledPrompt = await generatePrompt(promptInputs, prompt)

    console.log('Filled prompt:', filledPrompt)

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: filledPrompt }],
      max_tokens: 4096,
      temperature: 0.7,
    })

    const output = response.choices[0].message.content || ''

    const parsed = extractFirstJsonDict(output)

    if (!parsed) {
      throw new Error('Failed to parse LLM response')
    }

    // Convert to SimulationStep format before returning
    const step = {
      participantId: currentParticipantId,
      action: parsed.action as 'speak' | 'toggleCamera' | 'doNothing',
      message:
        parsed.action === 'speak' ? (parsed.message as string) : undefined,
      thinking: parsed.thinking as string,
      prompt: filledPrompt,
      rankingChanges: parsed.rankingChanges,
    }

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error in simulation API:', error)
    return NextResponse.json(
      {
        error:
          'Failed to process simulation step: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
