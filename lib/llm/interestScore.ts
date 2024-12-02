import OpenAI from 'openai'
import { generatePrompt } from './openai'
import { interestScorePrompt } from './prompts/prompts'
import { Participant, InterestScoreResponse, ParticipantInterestScore, SimulationStep } from '@/app/types/types'

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
    console.log('---END PROMPT---')

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500
    })

    const responseContent = completion.choices[0].message?.content || '{}'
    console.log('\nLLM Response:')
    console.log('---START RESPONSE---')
    console.log(responseContent)
    console.log('---END RESPONSE---')

    const response = JSON.parse(responseContent) as InterestScoreResponse

    console.log('\nParsed Score:')
    console.log(`Score: ${response.interestScore}`)
    console.log(`Reasoning: ${response.reasoning}`)

    return {
      participantId: participant.id,
      score: response.interestScore,
      reasoning: response.reasoning
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
