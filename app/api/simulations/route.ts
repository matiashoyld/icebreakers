import {
  SimulationInput,
  SimulationParticipantInput,
  SimulationTurnInput,
} from '@/app/types/api'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SimulationInput
    const {
      simulationType,
      participants,
      turns,
      taskScore,
      satisfactionScores,
    } = body

    // First create the simulation with participants
    const simulation = await prisma.simulation.create({
      data: {
        simulationType,
        totalTurns: turns.length,
        taskScore,
        participants: {
          create: participants.map(
            (participant: SimulationParticipantInput) => ({
              participantId: participant.id,
              name: participant.name,
              wordsSpoken: participant.wordsSpoken,
              cameraToggles: participant.cameraToggles,
              timesDoingNothing: participant.timesDoingNothing,
              participationRate: participant.participationRate,
              numberOfInteractions: participant.numberOfInteractions,
              satisfactionScore: satisfactionScores.find(
                (s) => s.participantId === participant.id
              )?.score,
              satisfactionExplanation: satisfactionScores.find(
                (s) => s.participantId === participant.id
              )?.explanation,
            })
          ),
        },
      },
      include: {
        participants: true,
      },
    })

    // Then create the turns with the correct participant IDs
    await prisma.simulationTurn.createMany({
      data: turns.map((turn: SimulationTurnInput) => {
        const participant = simulation.participants.find(
          (p) => p.participantId === turn.participantId
        )
        if (!participant)
          throw new Error(`Participant not found for turn ${turn.turnNumber}`)

        return {
          simulationId: simulation.id,
          participantId: participant.id,
          turnNumber: turn.turnNumber,
          action: turn.action,
          message: turn.message,
          thinkingProcess: turn.thinking,
          decision: turn.decision,
          engagementScore: turn.engagementScore,
          cameraStatus: turn.cameraStatus,
          prompt: turn.prompt,
        }
      }),
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
