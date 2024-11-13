import { generatePrompt } from '@/lib/llm/openai'
import { TURN_PROMPT } from '@/lib/llm/prompts/turn-prompt'
import { SimulationContext } from '@/lib/simulation/simulation-manager'
import { extractFirstJsonDict } from '@/lib/utils/json-parsers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Note: No NEXT_PUBLIC_ prefix
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { context, currentParticipantId } = body as {
      context: SimulationContext
      currentParticipantId: number
    }

    // Create context string about participants and their camera status
    const participantsContext = context.participants
      .map((p) => `${p.name}: Camera ${p.cameraOn ? 'ON' : 'OFF'}`)
      .join('\n')

    // Create dialogue history string
    const dialogueString = context.dialogueHistory.map((msg) => msg).join('\n')

    // For now, use empty string for agent persona (we'll add this later)
    const agentPersona = ''

    // Generate prompt using the template
    const filledPrompt = await generatePrompt(
      [
        agentPersona,
        participantsContext,
        dialogueString,
        context.conversationContext,
      ],
      TURN_PROMPT
    )

    // Get response from OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: filledPrompt }],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const output = response.choices[0].message.content || ''

    // Parse the response
    const parsed = extractFirstJsonDict(output)

    if (!parsed) {
      throw new Error('Failed to parse LLM response')
    }

    // Convert to SimulationStep format
    const step = {
      participantId: currentParticipantId,
      action: parsed.action as 'speak' | 'toggleCamera' | 'doNothing',
      message:
        parsed.action === 'speak' ? (parsed.message as string) : undefined,
      thinking: parsed.thinking as string,
    }

    return NextResponse.json(step)
  } catch (error) {
    console.error('Error in simulation API:', error)
    return NextResponse.json(
      { error: 'Failed to process simulation step' },
      { status: 500 }
    )
  }
}
