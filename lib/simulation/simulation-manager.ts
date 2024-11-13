import { Participant, SimulationStep } from '@/app/types/types'
import { generatePrompt, gptRequest } from '@/lib/llm/openai'
import { TURN_PROMPT } from '@/lib/llm/prompts/turn-prompt'
import { extractFirstJsonDict } from '@/lib/utils/json-parsers'

type SimulationContext = {
  participants: Participant[]
  currentTurn: number
  dialogueHistory: string[]
  conversationContext: string
}

export async function getNextSimulationStep(
  context: SimulationContext,
  currentParticipantId: number
): Promise<SimulationStep> {
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
  const response = await gptRequest(filledPrompt)

  // Parse the response
  const parsed = extractFirstJsonDict(response)

  if (!parsed) {
    throw new Error('Failed to parse LLM response')
  }

  // Convert to SimulationStep format
  return {
    participantId: currentParticipantId,
    action: parsed.action as 'speak' | 'toggleCamera' | 'doNothing',
    message: parsed.action === 'speak' ? parsed.message : undefined,
    thinking: parsed.thinking,
  }
}
