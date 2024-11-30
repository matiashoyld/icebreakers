import { Participant } from '@/app/types/types'
import { prisma } from '@/lib/db'

export type SimulationTurn = {
  turnNumber: number
  participantId: number
  action: string
  message?: string
  thinkingProcess: string
  decision: string
  engagementScore: number
  cameraStatus: boolean
}

export type SaveSimulationParams = {
  context: string
  participants: Participant[]
  turns: SimulationTurn[]
}

export async function saveSimulation({
  context,
  participants,
  turns,
}: SaveSimulationParams) {
  return await prisma.$transaction(async (tx) => {
    const simulation = await tx.simulation.create({
      data: {
        context,
        totalTurns: turns.length,
      },
    })

    const createdParticipants = await Promise.all(
      participants.map((p) =>
        tx.simulationParticipant.create({
          data: {
            simulationId: simulation.id,
            participantId: p.id,
            name: p.name,
            wordsSpoken: p.wordsSpoken,
            cameraToggles: p.cameraToggles,
            timesDoingNothing: p.timesDoingNothing,
            participationRate: p.participationRate,
          },
        })
      )
    )

    const participantIdMap = new Map(
      createdParticipants.map((p) => [p.participantId, p.id])
    )

    await Promise.all(
      turns.map((turn) =>
        tx.simulationTurn.create({
          data: {
            simulationId: simulation.id,
            participantId: participantIdMap.get(turn.participantId) || '',
            turnNumber: turn.turnNumber,
            action: turn.action,
            message: turn.message,
            thinkingProcess: turn.thinkingProcess,
            decision: turn.action,
            engagementScore: turn.engagementScore,
            cameraStatus: turn.cameraStatus,
          },
        })
      )
    )

    return tx.simulation.findUnique({
      where: { id: simulation.id },
      include: {
        participants: true,
        turns: {
          orderBy: {
            turnNumber: 'asc',
          },
        },
      },
    })
  })
}

export async function getSimulations() {
  return await prisma.simulation.findMany({
    include: {
      participants: true,
      _count: {
        select: { turns: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function getSimulationById(id: string) {
  return await prisma.simulation.findUnique({
    where: { id },
    include: {
      participants: true,
      turns: {
        orderBy: {
          turnNumber: 'asc',
        },
      },
    },
  })
}
