import { salvageItems } from '@/app/data/data'
import { Participant, SimulationStep } from '@/app/types/types'
import {
  baselinePrompt,
  gamificationPrompt,
  leadershipPrompt,
  socialPrompt,
} from '@/lib/llm/prompts/prompts'

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
  currentRanking: typeof salvageItems
  scenario: {
    id: 'baseline' | 'leadership' | 'social' | 'gamification'
  }
}

export async function getNextSimulationStep(
  input: SimulationInput,
  currentParticipantId: number
): Promise<SimulationStep> {
  const participant = input.participants.find(
    (p) => p.id === currentParticipantId
  )
  if (!participant) throw new Error('Participant not found')

  let prompt: string
  switch (input.scenario.id) {
    case 'leadership': {
      const leaderId = getOrSetLeader(input.participants)
      const isLeader = currentParticipantId === leaderId
      const leader = input.participants.find((p) => p.id === leaderId)
      if (!leader) throw new Error('Leader not found')
      prompt = leadershipPrompt(leader.name, isLeader)
      break
    }
    case 'social':
      prompt = socialPrompt()
      break
    case 'gamification':
      prompt = gamificationPrompt()
      break
    default:
      prompt = baselinePrompt('')
  }

  const currentRankingText =
    input.currentRanking.length === 0
      ? 'No items have been ranked yet.'
      : input.currentRanking
          .map((item, index) =>
            item ? `${index + 1}. ${item.name}` : `${index + 1}. Not ranked yet`
          )
          .join('\n')

  const promptInputs = [
    JSON.stringify(participant),
    JSON.stringify(input.participants),
    input.dialogueHistory.join('\n'),
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
        currentRanking: input.currentRanking,
      },
      currentParticipantId,
      promptInputs,
      prompt,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get next simulation step')
  }

  const responseData = await response.json()

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

const leaderMap = new Map<string, number>()

function getOrSetLeader(participants: Participant[]): number {
  const key = participants.map((p) => p.id).join(',')

  if (!leaderMap.has(key)) {
    const randomIndex = Math.floor(Math.random() * participants.length)
    const leaderId = participants[randomIndex].id
    leaderMap.set(key, leaderId)
  }

  return leaderMap.get(key)!
}
