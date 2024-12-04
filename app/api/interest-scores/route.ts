import { Participant, ParticipantInterestScore } from '@/app/types/types'
import { calculateInterestScores } from '@/lib/llm/interestScore'
import { getScenarioContext } from '@/lib/llm/prompts/prompts'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

// Move client initialization inside the handler
async function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured in environment variables')
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

export async function POST(request: Request) {
  try {
    console.log('\n=== Interest Scores API Call ===')
    console.log('Time:', new Date().toISOString())

    const openai = await getOpenAIClient()
    const body = await request.json()
    const {
      participants,
      conversationHistory,
      currentRanking,
      currentTurn,
      interestHistory,
      scenarioType,
      leaderId,
    } = body

    console.log('\n=== Leadership Context in Interest Scores API ===')
    console.log('- Scenario Type:', scenarioType)
    console.log('- Leader ID:', leaderId)
    console.log(
      '- Participants:',
      participants.map((p: Participant) => `${p.name} (ID: ${p.id})`)
    )

    const scores = await Promise.all(
      participants.map(async (participant: Participant) => {
        console.log(`\n--- Processing ${participant.name} ---`)
        console.log('- Participant ID:', participant.id)
        console.log('- Is Leader:', participant.id === leaderId ? 'YES' : 'NO')

        const scenarioContext = getScenarioContext(
          scenarioType,
          participant.id,
          leaderId
        )

        console.log('- Generated Context:', scenarioContext)
        console.log('------------------------')

        const participantScores = await calculateInterestScores(
          participants,
          conversationHistory,
          currentRanking,
          currentTurn,
          openai,
          interestHistory,
          scenarioContext
        )

        // Return just this participant's score
        return participantScores.find(
          (score) => score.participantId === participant.id
        )!
      })
    )

    // Filter out any undefined scores
    const validScores = scores.filter(
      (score): score is ParticipantInterestScore => score !== undefined
    )

    console.log('\nCalculated Scores:')
    validScores.forEach((score) => {
      console.log(
        `Participant ${score.participantId}: ${score.score} (${score.reasoning})`
      )
    })
    console.log('=== End Interest Scores API Call ===\n')

    return NextResponse.json({ scores: validScores })
  } catch (error) {
    console.error('Error calculating interest scores:', error)
    return NextResponse.json(
      { error: 'Failed to calculate interest scores' },
      { status: 500 }
    )
  }
}
