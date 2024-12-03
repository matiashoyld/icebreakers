import { generatePrompt } from '@/lib/llm/openai'
import { satisfactionScorePrompt } from '@/lib/llm/prompts/prompts'
import { extractFirstJsonDict } from '@/lib/utils/json-parsers'
import { NextResponse } from 'next/server'
import OpenAI from 'openai'

async function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error('OpenAI API key is not configured in environment variables')
  }

  return new OpenAI({
    apiKey: apiKey,
  })
}

/**
 * Calculates satisfaction score for a single participant
 */
async function calculateSatisfactionScore(
  participant: {
    participantId: number
    agentDescription: string
  },
  conversationHistory: string,
  openai: OpenAI
) {
  console.log(`\nProcessing Participant ${participant.participantId}:`)
    
  const filledPrompt = await generatePrompt(
    [participant.agentDescription, conversationHistory],
    satisfactionScorePrompt()
  )
  
  console.log('\nGenerated Prompt:')
  console.log('---START PROMPT---')
  console.log(filledPrompt)
  console.log('---END PROMPT---')

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: filledPrompt }],
    max_tokens: 1000,
    temperature: 0.7,
  })

  const output = response.choices[0].message.content || ''

  console.log('\nLLM Response:')
  console.log('---START RESPONSE---')
  console.log(output)
  console.log('---END RESPONSE---')

  const parsed = extractFirstJsonDict(output)

  console.log('\nExtracted Score:')
  console.log(parsed)

  if (!parsed) {
    throw new Error('Failed to parse satisfaction score from LLM response')
  }

  return {
    participantId: participant.participantId,
    score: parsed.score,
    explanation: parsed.explanation,
  }
}

export async function POST(request: Request) {
  try {
    console.log('\n=== Satisfaction Score API Call ===')
    console.log('Time:', new Date().toISOString())
    
    const openai = await getOpenAIClient()
    const body = await request.json()
    const { participants, conversationHistory } = body as {
      participants: Array<{
        participantId: number
        agentDescription: string
      }>
      conversationHistory: string
    }

    // Calculate all satisfaction scores in parallel
    const scores = await Promise.all(
      participants.map((participant) =>
        calculateSatisfactionScore(participant, conversationHistory, openai)
      )
    )

    console.log('=== End Satisfaction Score API Call ===\n')
    return NextResponse.json(scores)
  } catch (error) {
    console.error('Error calculating satisfaction scores:', error)
    return NextResponse.json(
      { error: 'Failed to calculate satisfaction scores' },
      { status: 500 }
    )
  }
}
