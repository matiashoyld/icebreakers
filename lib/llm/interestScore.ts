import {
  InterestScoreResponse,
  Participant,
  ParticipantInterestScore,
  SimulationStep,
} from '@/app/types/types'
import { countWords, estimateTokens } from '@/lib/utils/text-utils'
import OpenAI from 'openai'
import { generatePrompt } from './openai'
import { interestScorePrompt } from './prompts/prompts'

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

/**
 * Calculates interest scores for all participants based on the current conversation state
 */
export async function calculateInterestScores(
  participants: Participant[],
  conversationHistory: SimulationStep[],
  currentRanking: string[],
  currentTurn: number,
  openai: OpenAI
): Promise<ParticipantInterestScore[]> {
  console.log('\n=== Calculating Interest Scores ===')

  // Calculate all scores in parallel
  const scorePromises = participants.map(async (participant) => {
    console.log(
      `\nProcessing Participant ${participant.id} (${participant.name}):`
    )

    const prompt = await generatePrompt(
      [
        participant.agentDescription,
        JSON.stringify(participants),
        JSON.stringify(conversationHistory),
        JSON.stringify(currentRanking),
        currentTurn.toString(),
      ],
      interestScorePrompt()
    )

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
 * Determines the next participant based on interest scores, breaking ties by favoring
 * participants who haven't spoken recently
 */
export function selectNextParticipant(
  scores: ParticipantInterestScore[],
  conversationHistory: SimulationStep[] = []
): number {
  if (scores.length === 0) {
    throw new Error('No participants to select from')
  }

  // Group participants by their interest score to find ties
  const scoreGroups = scores.reduce((groups, score) => {
    const key = score.score
    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(score)
    return groups
  }, {} as Record<number, ParticipantInterestScore[]>)

  // Find the highest score
  const highestScore = Math.max(...Object.keys(scoreGroups).map(Number))
  const tiedParticipants = scoreGroups[highestScore]

  if (tiedParticipants.length === 1) {
    // No tie, return the highest scoring participant
    return tiedParticipants[0].participantId
  }

  // If there's a tie, find the last time each tied participant spoke
  const lastSpokenTurn = new Map<number, number>()

  // Initialize all tied participants as not having spoken (-1)
  tiedParticipants.forEach((p) => {
    lastSpokenTurn.set(p.participantId, -1)
  })

  // Go through conversation history to find the last time each participant spoke
  for (let i = conversationHistory.length - 1; i >= 0; i--) {
    const turn = conversationHistory[i]
    const participantId = turn.participantId

    // Only update if this participant is in the tied group and hasn't been recorded yet
    if (
      tiedParticipants.some((p) => p.participantId === participantId) &&
      !lastSpokenTurn.has(participantId)
    ) {
      lastSpokenTurn.set(participantId, i)
    }
  }

  // For debugging
  console.log('\nTie-breaking debug:')
  console.log('Full conversation history:', conversationHistory.length, 'turns')
  tiedParticipants.forEach((p) => {
    const lastTurn = lastSpokenTurn.get(p.participantId) ?? -1
    console.log(
      `Participant ${p.participantId}: Last spoke at turn ${lastTurn} (${
        lastTurn === -1
          ? 'never spoke'
          : lastTurn === conversationHistory.length - 1
          ? 'spoke last turn'
          : `${conversationHistory.length - 1 - lastTurn} turns ago`
      })`
    )
  })

  // Sort tied participants by when they last spoke (prefer those who spoke least recently)
  const sortedByLastSpoken = [...tiedParticipants].sort((a, b) => {
    const lastA = lastSpokenTurn.get(a.participantId) ?? -1
    const lastB = lastSpokenTurn.get(b.participantId) ?? -1
    return lastA - lastB // Lower turn number (spoke longer ago) comes first
  })

  // Return the participant ID directly from the sorted array
  return sortedByLastSpoken[0].participantId
}
