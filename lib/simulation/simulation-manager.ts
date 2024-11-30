import { salvageItems } from '@/app/data/data'
import { Participant, SimulationStep } from '@/app/types/types'

export type SimulationContext = {
  participants: Participant[]
  currentTurn: number
  dialogueHistory: string[]
  conversationContext: string
}

interface SimulationInput {
  participants: Participant[]
  currentTurn: number
  dialogueHistory: string[]
  conversationContext: string
  currentRanking: typeof salvageItems
}

export async function getNextSimulationStep(
  input: SimulationInput,
  currentParticipantId: number
): Promise<SimulationStep> {
  const participant = input.participants.find(
    (p) => p.id === currentParticipantId
  )
  if (!participant) throw new Error('Participant not found')

  const currentRankingText =
    input.currentRanking.length === 0
      ? 'No items have been ranked yet.'
      : input.currentRanking
          .map((item, index) => `${index + 1}. ${item.name}`)
          .join('\n')

  const promptInputs = [
    JSON.stringify(participant),
    JSON.stringify(input.participants),
    input.dialogueHistory.join('\n'),
    input.conversationContext,
    currentRankingText,
  ]

  const response = await fetch('/api/simulation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context: {
        participants: input.participants,
        currentTurn: input.currentTurn,
        dialogueHistory: input.dialogueHistory,
        conversationContext: input.conversationContext,
        currentRanking: input.currentRanking,
      },
      currentParticipantId,
      promptInputs,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get next simulation step')
  }

  const responseData = await response.json()
  console.log('API Response:', JSON.stringify(responseData, null, 2))

  const step: SimulationStep = {
    participantId: currentParticipantId,
    action: responseData.action,
    message: responseData.message,
    thinking: responseData.thinking,
    prompt: responseData.prompt,
    rankingChanges: responseData.rankingChanges,
  }

  return step
}
