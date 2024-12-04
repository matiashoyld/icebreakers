import { Participant } from '@/app/types/types'

export function formatParticipantInfo(participant: Participant): string {
  return `This is your description:
  Name: ${participant.name}
  Camera status: ${participant.cameraOn ? 'ON' : 'OFF'}
  Times you have toggled your camera: ${participant.cameraToggles}
  Speaking style: ${participant.speakingStyle}
  Agent description: ${participant.agentDescription}`
}

export function formatOtherParticipants(
  allParticipants: Participant[],
  currentParticipant: Participant
): string {
  const otherParticipants = allParticipants.filter(
    (p) => p.id !== currentParticipant.id
  )

  return `This is the current state of the other agents in the conversation:
  
  ${otherParticipants
    .map(
      (p) => `${p.name}:
  - Camera Status: ${p.cameraOn ? 'ON' : 'OFF'}
  - Times this agent has toggled the camera: ${p.cameraToggles}`
    )
    .join('\n\n')}`
}
