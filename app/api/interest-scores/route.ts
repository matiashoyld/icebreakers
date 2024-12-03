import { calculateInterestScores } from '@/lib/llm/interestScore'
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
    const { participants, conversationHistory, currentRanking, currentTurn } =
      body

    console.log('\nInput Data:')
    console.log('- Participants:', participants.length)
    console.log('- Current Turn:', currentTurn)
    console.log('- Conversation History Length:', conversationHistory.length)
    console.log('- Current Ranking Items:', currentRanking.length)

    const scores = await calculateInterestScores(
      participants,
      conversationHistory,
      currentRanking,
      currentTurn,
      openai
    )

    console.log('\nCalculated Scores:')
    scores.forEach((score) => {
      console.log(
        `Participant ${score.participantId}: ${score.score} (${score.reasoning})`
      )
    })
    console.log('=== End Interest Scores API Call ===\n')

    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Error calculating interest scores:', error)
    return NextResponse.json(
      { error: 'Failed to calculate interest scores' },
      { status: 500 }
    )
  }
}
