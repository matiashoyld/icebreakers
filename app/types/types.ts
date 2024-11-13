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

/**
 * Represents a message sent to the LLM.
 */
export type ChatMessage = {
  role: 'user' | 'assistant' | 'system'
  content:
    | string
    | {
        type: 'text' | 'image_url'
        text?: string
        image_url?: { url: string }
      }[]
}

/**
 * Represents a file attachment to be sent to the LLM.
 */
export type FileAttachment = {
  type: 'image' | 'pdf'
  base64Data: string
  path?: string
}

/**
 * Represents a response from the LLM.
 */
export type LLMResponse = {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}
