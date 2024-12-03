import OpenAI from 'openai'
import { generatePrompt } from './openai'
import { interestScorePrompt } from './prompts/prompts'
import { Participant, InterestScoreResponse, ParticipantInterestScore, SimulationStep } from '@/app/types/types'
import { countWords, estimateTokens } from '@/lib/utils/text-utils'

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
    console.log(`\nProcessing Participant ${participant.id} (${participant.name}):`)
    
    const prompt = await generatePrompt(
      [
        participant.agentDescription,
        JSON.stringify(participants),
        JSON.stringify(conversationHistory),
        JSON.stringify(currentRanking),
        currentTurn.toString()
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
      max_tokens: 2048  // Allow for larger responses while leaving room for the prompt
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
      if (typeof response.interestScore !== 'number' || typeof response.reasoning !== 'string') {
        throw new Error('Invalid response format: missing required fields')
      }

      console.log('\nParsed Score:')
      console.log(`Score: ${response.interestScore}`)
      console.log(`Reasoning: ${response.reasoning}`)

      return {
        participantId: participant.id,
        score: response.interestScore,
        reasoning: response.reasoning
      }
    } catch (error) {
      console.error('Error parsing response:', error)
      // Return a default score in case of parsing error
      return {
        participantId: participant.id,
        score: 50, // default middle score
        reasoning: 'Error parsing response'
      }
    }
  })

  // Wait for all scores to be calculated
  const scores = await Promise.all(scorePromises)
  console.log('\n=== Finished Calculating Interest Scores ===')

  return scores
}

/**
 * Determines the next participant based on interest scores
 */
export function selectNextParticipant(scores: ParticipantInterestScore[]): number {
  if (scores.length === 0) {
    throw new Error('No participants to select from')
  }

  // Find the participant with the highest score
  const highestScore = scores.reduce((prev, current) => {
    return prev.score > current.score ? prev : current
  })

  return highestScore.participantId
}
