import { Simulation } from '@prisma/client'

export type ApiResponse<T> = {
  data?: T
  error?: string
}

export type SimulationResponse = ApiResponse<Simulation>

export type SimulationParticipantInput = {
  id: number
  name: string
  wordsSpoken: number
  cameraToggles: number
  timesDoingNothing: number
  participationRate: number
  numberOfInteractions: number
}

export type SimulationTurnInput = {
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

export type SatisfactionScore = {
  participantId: number
  score: number
  explanation: string
}

export type SimulationInput = {
  simulationType: string
  participants: SimulationParticipantInput[]
  turns: SimulationTurnInput[]
  taskScore: number
  satisfactionScores: SatisfactionScore[]
}
