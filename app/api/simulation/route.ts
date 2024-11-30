import { generatePrompt } from '@/lib/llm/openai'
import { TURN_PROMPT } from '@/lib/llm/prompts/turn-prompt'
import { SimulationContext } from '@/lib/simulation/simulation-manager'
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
    const { context, currentParticipantId, promptInputs } = body as {
      context: SimulationContext
      currentParticipantId: number
      promptInputs: string[]
    }

    // Generate prompt using the template and all inputs from the client
    const filledPrompt = await generatePrompt(promptInputs, TURN_PROMPT)

    console.log('Filled prompt:', filledPrompt)

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: filledPrompt }],
      max_tokens: 4096,
      temperature: 0.7,
    })

    const output = response.choices[0].message.content || ''
    console.log('LLM Response:', output)

    const parsed = extractFirstJsonDict(output)
    console.log('Parsed Response:', parsed)

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
    console.log('Step being returned:', step)

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
