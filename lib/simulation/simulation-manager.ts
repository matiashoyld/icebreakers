import { Participant, SimulationStep } from '@/app/types/types'

export type SimulationContext = {
  participants: Participant[]
  currentTurn: number
  dialogueHistory: string[]
  conversationContext: string
}

export async function getNextSimulationStep(
  context: SimulationContext,
  currentParticipantId: number
): Promise<SimulationStep> {
  const response = await fetch('/api/simulation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      context,
      currentParticipantId,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get next simulation step')
  }

  return response.json()
}
