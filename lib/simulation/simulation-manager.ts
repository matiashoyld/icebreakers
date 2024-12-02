import { salvageItems } from '@/app/data/data'
import { Participant, SimulationStep } from '@/app/types/types'
import {
  baselinePrompt,
  gamificationPrompt,
  leadershipPrompt,
  socialPrompt,
} from '@/lib/llm/prompts/prompts'
import { selectNextParticipant } from '@/lib/llm/interestScore'
import OpenAI from 'openai'

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
  input: SimulationInput
): Promise<{ step: SimulationStep; nextParticipantId: number }> {
  // Calculate interest scores using the API endpoint
  const interestScoreResponse = await fetch('/api/interest-scores', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      participants: input.participants,
      conversationHistory: input.dialogueHistory.map((msg, index) => ({
        participantId: (index % input.participants.length) + 1,
        action: 'speak',
        message: msg,
        thinking: '',
        prompt: ''
      })),
      currentRanking: input.currentRanking.map(item => item.name),
      currentTurn: input.currentTurn,
    }),
  })

  if (!interestScoreResponse.ok) {
    throw new Error('Failed to calculate interest scores')
  }

  const { scores } = await interestScoreResponse.json()

  // Select the next participant based on interest scores
  const nextParticipantId = selectNextParticipant(scores)
  
  const participant = input.participants.find(
    (p) => p.id === nextParticipantId
  )
  if (!participant) throw new Error('Participant not found')

  let prompt: string
  switch (input.scenario.id) {
    case 'leadership': {
      const leaderId = getOrSetLeader(input.participants)
      const isLeader = nextParticipantId === leaderId
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
    input.currentTurn.toString(),
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
      currentParticipantId: nextParticipantId,
      promptInputs,
      prompt,
    }),
  })

  if (!response.ok) {
    throw new Error('Failed to get next simulation step')
  }

  const responseData = await response.json()

  const step: SimulationStep = {
    participantId: nextParticipantId,
    action: responseData.action,
    message: responseData.message,
    thinking: responseData.thinking,
    prompt: responseData.prompt,
    rankingChanges: responseData.rankingChanges,
  }

  return { step, nextParticipantId }
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
