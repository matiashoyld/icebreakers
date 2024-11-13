/**
 * Represents a participant in the simulation.
 */
export type Participant = {
  id: number
  name: string
  avatar: string
  cameraOn: boolean
  wordsSpoken: number
  timesDoingNothing: number
  cameraToggles: number
  participationRate: number
}

/**
 * Represents a single step in the simulation.
 */
export type SimulationStep = {
  participantId: number
  action: 'speak' | 'toggleCamera' | 'doNothing'
  message?: string
  thinking?: string
}

/**
 * Represents a message sent by a participant.
 */
export type Message = {
  id: number
  participantId: number
  content: string
}

/**
 * Represents engagement data for an agent at a specific turn.
 */
export type EngagementData = {
  turn: number
  engagement: number
  agentId: number
}
