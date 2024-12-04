import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      simulationType,
      participants,
      turns,
      taskScore,
      satisfactionScores,
    } = body

    const simulation = await prisma.simulation.create({
      data: {
        simulationType,
        totalTurns: turns.length,
        taskScore,
        participants: {
          create: participants.map((participant: any) => ({
            participantId: participant.id,
            name: participant.name,
            wordsSpoken: participant.wordsSpoken,
            cameraToggles: participant.cameraToggles,
            timesDoingNothing: participant.timesDoingNothing,
            participationRate: participant.participationRate,
            numberOfInteractions: participant.numberOfInteractions,
            satisfactionScore: satisfactionScores.find(
              (s: any) => s.participantId === participant.id
            )?.score,
            satisfactionExplanation: satisfactionScores.find(
              (s: any) => s.participantId === participant.id
            )?.explanation,
          })),
        },
        turns: {
          create: turns.map((turn: any) => ({
            turnNumber: turn.turnNumber,
            participantId: turn.participantId.toString(),
            action: turn.action,
            message: turn.message,
            thinkingProcess: turn.thinking,
            decision: turn.decision,
            engagementScore: turn.engagementScore,
            cameraStatus: turn.cameraStatus,
            prompt: turn.prompt,
          })),
        },
      },
    })

    return NextResponse.json({ id: simulation.id })
  } catch (error) {
    console.error('Error saving simulation:', error)
    return NextResponse.json(
      { error: 'Failed to save simulation' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const simulations = await prisma.simulation.findMany({
      include: {
        participants: true,
        turns: true,
      },
    })
    return NextResponse.json(simulations)
  } catch (error) {
    console.error('Error in simulation API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch simulations' },
      { status: 500 }
    )
  }
}
