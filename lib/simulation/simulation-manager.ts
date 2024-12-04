import { MAX_SIMULATION_TURNS } from '@/app/constants/constants'
import { salvageItems } from '@/app/data/data'
import { Participant, SimulationStep } from '@/app/types/types'
import { selectNextParticipant } from '@/lib/llm/interestScore'
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
  conversationHistory: SimulationStep[]
  currentRanking: typeof salvageItems
  scenario: {
    id: 'baseline' | 'leadership' | 'social' | 'gamification'
  }
  recentChanges?: boolean[]
}

export type SimulationEndCondition = {
  ended: boolean
  reason: 'max_turns' | 'no_changes' | null
}

function formatParticipantInfo(participant: Participant): string {
  return `This is your description:
Name: ${participant.name}
Camera status: ${participant.cameraOn ? 'ON' : 'OFF'}
Times you have toggled your camera: ${participant.cameraToggles}
Speaking style: ${participant.speakingStyle}
Agent description: ${participant.agentDescription}`
}

function formatOtherParticipants(
  allParticipants: Participant[],
  currentParticipant: Participant
): string {
  const otherParticipants = allParticipants.filter(
    (p) => p.id !== currentParticipant.id
  )

  return `This is the current state of the other agents in the conversation:

${otherParticipants
  .map(
    (p) => `${p.name}:
- Camera Status: ${p.cameraOn ? 'ON' : 'OFF'}
- Times this agent has toggled the camera: ${p.cameraToggles}`
  )
  .join('\n\n')}`
}

function checkSimulationEnd(
  currentTurn: number,
  recentChanges: boolean[]
): SimulationEndCondition {
  // Check max turns
  if (currentTurn >= MAX_SIMULATION_TURNS) {
    return { ended: true, reason: 'max_turns' }
  }

  // Check for 4 consecutive turns without changes
  if (recentChanges.length >= 4 && recentChanges.every((change) => !change)) {
    return { ended: true, reason: 'no_changes' }
  }

  return { ended: false, reason: null }
}

export async function getNextSimulationStep(input: SimulationInput): Promise<{
  step: SimulationStep
  nextParticipantId: number
  endCondition: SimulationEndCondition
  interestScores: { participantId: number; score: number }[]
}> {
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
        prompt: '',
      })),
      currentRanking: input.currentRanking.map((item) => item.name),
      currentTurn: input.currentTurn,
    }),
  })

  if (!interestScoreResponse.ok) {
    throw new Error('Failed to calculate interest scores')
  }

  const { scores } = await interestScoreResponse.json()

  // Get conversation history in the correct format
  const conversationHistory = input.dialogueHistory.map((msg, index) => ({
    participantId: (index % input.participants.length) + 1,
    action: 'speak' as const,
    message: msg,
    thinking: '',
    prompt: '',
  }))

  // Add the current turn's history
  const fullHistory = [
    ...conversationHistory,
    ...(input.conversationHistory || []), // Include any previous turns from this session
  ]

  // Select the next participant based on interest scores and conversation history
  const nextParticipantId = selectNextParticipant(scores, fullHistory)

  const participant = input.participants.find((p) => p.id === nextParticipantId)
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

  const currentRankingText = (() => {
    if (input.currentRanking.length === 0) {
      return 'No items have been ranked yet.'
    }

    // Get the ranked items text
    const rankedItemsText = Array(15)
      .fill(null)
      .map((_, index) => {
        const item = input.currentRanking.find(
          (rankItem) => rankItem.realRank === index + 1
        )
        return `${index + 1}. ${item ? item.name : '-'}`
      })
      .join('\n')

    // Get the unranked items
    const rankedItemNames = input.currentRanking.map((item) => item.name)
    const unrankedItems = salvageItems
      .filter((item) => !rankedItemNames.includes(item.name))
      .map((item) => `- ${item.name}`)
      .join('\n')

    return `${rankedItemsText}

${unrankedItems.length > 0 ? `Still not ranked:\n${unrankedItems}` : ''}`
  })()

  const modifiedDialogueHistory =
    input.dialogueHistory.length === 0
      ? 'This is the start of the conversation, you are the first agent to speak.'
      : input.dialogueHistory
          .map((line) => {
            // Match the participant name only at the start of the line after the number
            const pattern = new RegExp(`^(\\d+\\. )(${participant.name}:)`, 'g')
            return line.replace(pattern, `$1${participant.name} (You):`)
          })
          .join('\n')

  const promptInputs = [
    formatParticipantInfo(participant),
    formatOtherParticipants(input.participants, participant),
    modifiedDialogueHistory,
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

  // Track if this turn had any ranking changes
  const hadChanges = step.rankingChanges && step.rankingChanges.length > 0

  // Get the last 4 turns' changes (including this one)
  const recentChanges = [...(input.recentChanges || []), hadChanges]
    .slice(-4)
    .filter((change): change is boolean => change !== undefined)

  // Check end conditions
  const endCondition = checkSimulationEnd(input.currentTurn + 1, recentChanges)

  return {
    step,
    nextParticipantId,
    endCondition,
    interestScores: scores,
  }
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