import {
  CAMERA_TOGGLE_THRESHOLD,
  MAX_SIMULATION_TURNS,
} from '@/app/constants/constants'
import { salvageItems } from '@/app/data/data'
import { Participant, SimulationStep } from '@/app/types/types'
import { selectNextParticipant } from '@/lib/llm/interestScore'
import {
  baselinePrompt,
  gamificationPrompt,
  leadershipPrompt,
  socialPrompt,
} from '@/lib/llm/prompts/prompts'
import {
  formatOtherParticipants,
  formatParticipantInfo,
} from '@/lib/utils/prompt-utils'

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
  interestHistory: Array<{
    turn: number
    score: number
    participantId: number
  }>
}

export type SimulationEndCondition = {
  ended: boolean
  reason: 'max_turns' | 'no_changes' | null
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
  const leaderId =
    input.scenario.id === 'leadership'
      ? getOrSetLeader(input.participants)
      : undefined

  console.log('\n=== Leadership Debug in Simulation Manager ===')
  console.log('- Scenario Type:', input.scenario.id)
  console.log('- Leader ID:', leaderId)
  console.log(
    '- Participants:',
    input.participants.map((p) => `${p.name} (ID: ${p.id})`)
  )
  console.log('=== End Leadership Debug ===\n')

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
      interestHistory: input.interestHistory,
      scenarioType: input.scenario.id,
      leaderId, // Pass the extracted leaderId
    }),
  })

  if (!interestScoreResponse.ok) {
    throw new Error('Failed to calculate interest scores')
  }

  const { scores } = await interestScoreResponse.json()

  // After getting interest scores, check if any participants need camera updates
  const participantsToUpdate = scores.filter(
    (score: { participantId: number; score: number }) => {
      const participant = input.participants.find(
        (p) => p.id === score.participantId
      )
      if (!participant) return false

      // Check if camera should be turned off (score below threshold and camera is on)
      if (score.score < CAMERA_TOGGLE_THRESHOLD && participant.cameraOn) {
        return true
      }
      // Check if camera should be turned on (score above threshold and camera is off)
      if (score.score >= CAMERA_TOGGLE_THRESHOLD && !participant.cameraOn) {
        return true
      }
      return false
    }
  )

  // If any participant needs their camera toggled, handle it before the regular turn
  if (participantsToUpdate.length > 0) {
    const participantToUpdate = participantsToUpdate[0]
    const participant = input.participants.find(
      (p) => p.id === participantToUpdate.participantId
    )!

    const step: SimulationStep = {
      participantId: participant.id,
      action: 'toggleCamera',
      message: `${participant.name} ${
        participant.cameraOn ? 'turned off' : 'turned on'
      } their camera due to their interest level ${
        participant.cameraOn ? 'dropping below' : 'rising above'
      } ${CAMERA_TOGGLE_THRESHOLD}%`,
      thinking: `My interest level is ${participantToUpdate.score}%, which is ${
        participant.cameraOn ? 'below' : 'above'
      } the threshold of ${CAMERA_TOGGLE_THRESHOLD}%. I should ${
        participant.cameraOn ? 'turn off' : 'turn on'
      } my camera.`,
      prompt: '',
      rankingChanges: [],
    }

    return {
      step,
      nextParticipantId: participant.id,
      endCondition: checkSimulationEnd(
        input.currentTurn + 1,
        input.recentChanges || []
      ),
      interestScores: scores,
    }
  }

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

  // Check end conditions before updating state
  const endCondition = checkSimulationEnd(input.currentTurn + 1, recentChanges)

  // If this is the final turn (MAX_SIMULATION_TURNS), handle it specially
  if (endCondition.ended && endCondition.reason === 'max_turns') {
    // Add a small delay to ensure state updates are processed
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

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
