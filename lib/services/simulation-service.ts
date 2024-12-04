import { Participant } from '@/app/types/types'
import { prisma } from '@/lib/db'

export type SimulationTurn = {
  turnNumber: number
  participantId: number
  action: string
  message?: string
  thinking: string
  decision: string
  engagementScore: number
  cameraStatus: boolean
  prompt: string
}

export type SaveSimulationParams = {
  simulationType: 'baseline' | 'leadership' | 'social' | 'gamification'
  participants: Participant[]
  turns: SimulationTurn[]
  taskScore: number
  satisfactionScores: {
    participantId: number
    score: number
    explanation: string
  }[]
}

export async function saveSimulation({
  simulationType,
  participants,
  turns,
  taskScore,
  satisfactionScores,
}: SaveSimulationParams) {
  return await prisma.$transaction(async (tx) => {
    const simulation = await tx.simulation.create({
      data: {
        simulationType,
        totalTurns: turns.length,
        taskScore,
      },
    })

    const createdParticipants = await Promise.all(
      participants.map((p) => {
        const satisfactionData = satisfactionScores.find(
          (s) => s.participantId === p.id
        )
        return tx.simulationParticipant.create({
          data: {
            simulationId: simulation.id,
            participantId: p.id,
            name: p.name,
            wordsSpoken: p.wordsSpoken,
            cameraToggles: p.cameraToggles,
            timesDoingNothing: p.timesDoingNothing,
            participationRate: p.participationRate,
            numberOfInteractions: p.numberOfInteractions,
            satisfactionScore: satisfactionData?.score ?? null,
            satisfactionExplanation: satisfactionData?.explanation ?? null,
          },
        })
      })
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
            thinkingProcess: turn.thinking,
            decision: turn.action,
            engagementScore: turn.engagementScore,
            cameraStatus: turn.cameraStatus,
            prompt: turn.prompt,
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
  const simulations = await prisma.simulation.findMany({
    include: {
      participants: {
        select: {
          participationRate: true,
          satisfactionScore: true,
        },
      },
      _count: {
        select: { turns: true },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return simulations.map((simulation) => {
    // Calculate average participation
    const avgParticipation =
      simulation.participants.reduce(
        (sum, p) => sum + p.participationRate * 100,
        0
      ) / simulation.participants.length

    // Calculate average satisfaction
    const satisfactionScores = simulation.participants
      .map((p) => p.satisfactionScore)
      .filter((score): score is number => score !== null)

    const avgSatisfaction =
      satisfactionScores.length > 0
        ? satisfactionScores.reduce((sum, score) => sum + score, 0) /
          satisfactionScores.length
        : null

    return {
      id: simulation.id,
      createdAt: simulation.createdAt.toISOString(),
      simulationType: simulation.simulationType as
        | 'baseline'
        | 'leadership'
        | 'social'
        | 'gamification',
      totalTurns: simulation._count.turns,
      taskScore: simulation.taskScore,
      avgParticipation,
      avgSatisfaction,
    }
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

export async function deleteSimulation(id: string) {
  return await prisma.$transaction(async (tx) => {
    // Delete all turns first
    await tx.simulationTurn.deleteMany({
      where: { simulationId: id },
    })

    // Delete all participants
    await tx.simulationParticipant.deleteMany({
      where: { simulationId: id },
    })

    // Finally delete the simulation
    return await tx.simulation.delete({
      where: { id },
    })
  })
}
