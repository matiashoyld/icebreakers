import { salvageItems } from '@/app/data/data'
import {
  InterestScoreResponse,
  Participant,
  ParticipantInterestScore,
  SimulationStep,
} from '@/app/types/types'
import {
  formatOtherParticipants,
  formatParticipantInfo,
} from '@/lib/utils/prompt-utils'
import { countWords, estimateTokens } from '@/lib/utils/text-utils'
import OpenAI from 'openai'
import { generatePrompt } from './openai'
import { interestScorePrompt } from './prompts/prompts'
/**
 * Calculates how many turns ago a participant last spoke
 */
function calculateTurnsSinceLastSpoke(
  participantId: number,
  conversationHistory: SimulationStep[]
): number {
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    if (conversationHistory[i].participantId === participantId) {
      return conversationHistory.length - 1 - i
    }
  }
  return conversationHistory.length // Never spoke
}

/**
 * Gets the speaking frequency of a participant
 */
function calculateSpeakingFrequency(
  participantId: number,
  conversationHistory: SimulationStep[]
): number {
  const speakingTurns = conversationHistory.filter(
    (turn) => turn.participantId === participantId
  ).length
  return speakingTurns / Math.max(1, conversationHistory.length)
}

/**
 * Calculates interest scores for all participants based on the current conversation state
 */
export async function calculateInterestScores(
  participants: Participant[],
  conversationHistory: SimulationStep[],
  currentRanking: string[],
  currentTurn: number,
  openai: OpenAI,
  interestHistory: Array<{
    turn: number
    score: number
    participantId: number
  }>
): Promise<ParticipantInterestScore[]> {
  console.log('\n=== Calculating Interest Scores ===')

  // Calculate all scores in parallel
  const scorePromises = participants.map(async (participant) => {
    console.log(
      `\nProcessing Participant ${participant.id} (${participant.name}):`
    )

    // Format dialogue history similar to simulation-manager.ts
    const modifiedDialogueHistory =
      conversationHistory.length === 0
        ? 'This is the start of the conversation, you are the first agent to speak.'
        : conversationHistory
            .map((step) => {
              const speaker = participants.find(
                (p) => p.id === step.participantId
              )
              const prefix = speaker?.id === participant.id ? ' (You)' : ''
              return `${speaker?.name}${prefix}: ${step.message}`
            })
            .join('\n')

    // Format current ranking similar to simulation-manager.ts
    const currentRankingText = (() => {
      if (currentRanking.length === 0) {
        return 'No items have been ranked yet.'
      }

      // Get the ranked items text
      const rankedItemsText = Array(15)
        .fill(null)
        .map((_, index) => {
          const item = currentRanking[index]
          return `${index + 1}. ${item || '-'}`
        })
        .join('\n')

      // Get the unranked items
      const unrankedItems = salvageItems
        .filter((item) => !currentRanking.includes(item.name))
        .map((item) => `- ${item.name}`)
        .join('\n')

      return `${rankedItemsText}

${unrankedItems.length > 0 ? `Still not ranked:\n${unrankedItems}` : ''}`
    })()

    // Format interest history for the prompt
    const formattedInterestHistory = interestHistory
      .filter((entry) => entry.participantId === participant.id)
      .map((entry) => `Turn ${entry.turn}: Score: ${entry.score}`)
      .join('\n')

    // If there's no history, add a note
    const finalFormattedHistory =
      formattedInterestHistory ||
      'No previous interest scores for this participant.'

    const promptInputs = [
      formatParticipantInfo(participant),
      formatOtherParticipants(participants, participant),
      modifiedDialogueHistory,
      currentRankingText,
      currentTurn.toString(),
      finalFormattedHistory, // Add interest history as new input
    ]

    const prompt = await generatePrompt(promptInputs, interestScorePrompt())

    console.log('\nGenerated Interest Score Prompt:')
    console.log('---START PROMPT---')
    console.log(prompt)
    console.log(`Word count: ${countWords(prompt)}`)
    console.log(`Estimated tokens: ${estimateTokens(prompt)}`)
    console.log('---END PROMPT---')

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2048, // Allow for larger responses while leaving room for the prompt
    })

    const responseContent = completion.choices[0].message?.content || '{}'
    console.log('\nLLM Response:')
    console.log('---START RESPONSE---')
    console.log(responseContent)
    console.log('---END RESPONSE---')

    try {
      // Clean and parse the response
      const cleanedResponse = cleanJsonResponse(responseContent)
      const response = JSON.parse(cleanedResponse) as InterestScoreResponse

      // Validate the required fields
      if (
        typeof response.interestScore !== 'number' ||
        typeof response.reasoning !== 'string'
      ) {
        throw new Error('Invalid response format: missing required fields')
      }

      console.log('\nParsed Score:')
      console.log(`Score: ${response.interestScore}`)
      console.log(`Reasoning: ${response.reasoning}`)

      return {
        participantId: participant.id,
        score: response.interestScore,
        reasoning: response.reasoning,
      }
    } catch (error) {
      console.error('Error parsing response:', error)
      // Return a default score in case of parsing error
      return {
        participantId: participant.id,
        score: 50, // default middle score
        reasoning: 'Error parsing response',
      }
    }
  })

  // Wait for all scores to be calculated
  const scores = await Promise.all(scorePromises)
  console.log('\n=== Finished Calculating Interest Scores ===')

  return scores
}

/**
 * Determines the next participant based on interest scores and turn recency
 */
export function selectNextParticipant(
  scores: ParticipantInterestScore[],
  conversationHistory: SimulationStep[]
): number {
  if (scores.length === 0) {
    throw new Error('No participants to select from')
  }

  // Find the highest score
  const maxScore = Math.max(...scores.map((s) => s.score))

  // Get all participants with the highest score
  const topParticipants = scores.filter((s) => s.score === maxScore)

  if (topParticipants.length === 1) {
    // If there's only one top participant, select them
    return topParticipants[0].participantId
  }

  // If there are multiple participants with the same top score,
  // select the one who hasn't spoken in the longest time or hasn't spoken at all
  return topParticipants.reduce((bestCandidate, current) => {
    // Find last turn for each participant
    const bestCandidateLastTurn = conversationHistory
      .map((turn) => turn.participantId)
      .lastIndexOf(bestCandidate.participantId)

    const currentLastTurn = conversationHistory
      .map((turn) => turn.participantId)
      .lastIndexOf(current.participantId)

    // If current participant hasn't spoken yet (-1), prioritize them
    if (currentLastTurn === -1) {
      return current
    }

    // If best candidate hasn't spoken yet, keep them
    if (bestCandidateLastTurn === -1) {
      return bestCandidate
    }

    // Otherwise, select the one who spoke less recently
    return currentLastTurn < bestCandidateLastTurn ? current : bestCandidate
  }).participantId
}

/**
 * Calculates engagement score for a participant
 */
export function getEngagementScore(
  participantId: number,
  conversationHistory: SimulationStep[],
  currentInterestScore: number
): number {
  const turnsSinceLastSpoke = calculateTurnsSinceLastSpoke(
    participantId,
    conversationHistory
  )
  const speakingFrequency = calculateSpeakingFrequency(
    participantId,
    conversationHistory
  )

  // Base the engagement score on multiple factors
  const baseScore = currentInterestScore
  const recencyBonus = Math.max(0, 20 - turnsSinceLastSpoke * 2) // Up to 20 points bonus for recent participation
  const frequencyFactor = speakingFrequency * 10 // Up to 10 points based on overall participation

  // Combine factors with weights
  const engagementScore = Math.min(
    100,
    Math.max(
      0,
      baseScore * 0.7 + // Interest score has highest weight
        recencyBonus * 0.2 + // Recency has medium weight
        frequencyFactor * 0.1 // Frequency has lowest weight
    )
  )

  return Math.round(engagementScore)
}

/**
 * Cleans a string that might contain a JSON object with markdown formatting
 */
function cleanJsonResponse(response: string): string {
  // Remove markdown code block syntax if present
  response = response.replace(/```json\n?/g, '').replace(/```\n?/g, '')

  // Find the first '{' and last '}' to extract the JSON object
  const startIndex = response.indexOf('{')
  const endIndex = response.lastIndexOf('}')

  if (startIndex === -1 || endIndex === -1) {
    throw new Error('No valid JSON object found in response')
  }

  return response.slice(startIndex, endIndex + 1)
}
