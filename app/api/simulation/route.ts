import { generatePrompt } from '@/lib/llm/openai'
import { TURN_PROMPT } from '@/lib/llm/prompts/turn-prompt'
import { SimulationContext } from '@/lib/simulation/simulation-manager'
import { extractFirstJsonDict } from '@/lib/utils/json-parsers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { readFileSync } from 'fs'
import path from 'path'

// Add this near the top of the file
const AGENT_PERSONA_FILES = {
  1: 'absinha.txt',  // Diana
  2: 'bradley.txt',  // Bob
  3: 'drew.txt',     // Charlie
  4: 'wpo.txt'       // Alice
}

function getAgentPersona(participantId: number): string {
  const filename = AGENT_PERSONA_FILES[participantId]
  if (!filename) return ''
  
  try {
    const filePath = path.join(process.cwd(), 'agent_personas', filename)
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    console.error(`Failed to read persona file for participant ${participantId}:`, error)
    return ''
  }
}

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

    // Replace the empty agentPersona with the content from the corresponding file
    const agentPersona = getAgentPersona(currentParticipantId)

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
      model: 'gpt-4o-mini', // Updated to use a valid model name
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
      {
        error:
          'Failed to process simulation step: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      },
      { status: 500 }
    )
  }
}
