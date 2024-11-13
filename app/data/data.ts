import { Participant, SimulationStep } from '@/app/types/types'

/**
 * Initial participants in the simulation.
 */
export const initialParticipants: Participant[] = [
  {
    id: 1,
    name: 'Alice',
    avatar: '/images/alice.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
  {
    id: 2,
    name: 'Bob',
    avatar: '/images/bob.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
  {
    id: 3,
    name: 'Charlie',
    avatar: '/images/charlie.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
  {
    id: 4,
    name: 'Diana',
    avatar: '/images/diana.gif',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
]

/**
 * Sequence of simulation steps defining actions by participants.
 */
export const simulationSteps: SimulationStep[] = [
  {
    participantId: 1,
    action: 'speak',
    message: 'Hi everyone, shall we start the discussion?',
    thinking: 'I should initiate the conversation to get things started.',
  },
  {
    participantId: 2,
    action: 'speak',
    message: "Sure, what's our topic today?",
    thinking: "I'm interested in the topic and want to clarify our focus.",
  },
  {
    participantId: 3,
    action: 'toggleCamera',
    thinking:
      "I'm feeling a bit self-conscious and want to turn off my camera.",
  },
  {
    participantId: 4,
    action: 'speak',
    message: "I think we're discussing the latest AI developments.",
    thinking: 'I want to contribute by confirming the topic.',
  },
  {
    participantId: 1,
    action: 'speak',
    message:
      "That's right. What do you all think about the recent breakthroughs?",
    thinking: 'I should guide the discussion towards specific aspects of AI.',
  },
  {
    participantId: 2,
    action: 'doNothing',
    thinking: "I'm not sure what to say at this moment, so I'll stay quiet.",
  },
  {
    participantId: 3,
    action: 'speak',
    message:
      'I find it fascinating, especially in natural language processing.',
    thinking: 'I want to share my interest in a specific area of AI.',
  },
  {
    participantId: 4,
    action: 'toggleCamera',
    thinking:
      "I'm feeling more comfortable now and want to turn my camera back on.",
  },
  {
    participantId: 1,
    action: 'speak',
    message: 'Agreed. Any concerns about ethical implications?',
    thinking:
      'I should bring up potential challenges to deepen our discussion.',
  },
  {
    participantId: 2,
    action: 'speak',
    message: 'Yes, I worry about privacy and job displacement.',
    thinking: "I want to express my concerns about AI's impact on society.",
  },
  {
    participantId: 3,
    action: 'speak',
    message: 'I think we need to consider the impact on education systems.',
    thinking: 'I want to expand the discussion to include societal impacts.',
  },
  {
    participantId: 4,
    action: 'doNothing',
    thinking: "I'm processing everyone's points and formulating my thoughts.",
  },
  {
    participantId: 1,
    action: 'speak',
    message:
      'Good point about education. AI could revolutionize personalized learning.',
    thinking: 'I should acknowledge and build upon the previous point.',
  },
  {
    participantId: 2,
    action: 'toggleCamera',
    thinking: 'Need to quickly step away for a moment.',
  },
  {
    participantId: 3,
    action: 'doNothing',
    thinking: 'Waiting to see if others want to contribute.',
  },
  {
    participantId: 4,
    action: 'speak',
    message:
      'What about the digital divide? Not everyone has equal access to AI tools.',
    thinking: 'I should raise concerns about accessibility and equality.',
  },
  {
    participantId: 2,
    action: 'toggleCamera',
    thinking: "I'm back and ready to participate again.",
  },
  {
    participantId: 1,
    action: 'speak',
    message: 'The digital divide is a crucial issue. How can we address this?',
    thinking:
      'This is a good opportunity to encourage problem-solving discussion.',
  },
  {
    participantId: 3,
    action: 'speak',
    message:
      'We could start with improving infrastructure in underserved areas.',
    thinking: 'Contributing a practical solution to the problem.',
  },
  {
    participantId: 2,
    action: 'speak',
    message: 'And perhaps implement community AI learning centers?',
    thinking: 'Adding another concrete suggestion to the discussion.',
  },
  {
    participantId: 4,
    action: 'toggleCamera',
    thinking: 'Taking a quick break but still listening.',
  },
  {
    participantId: 1,
    action: 'doNothing',
    thinking: 'Letting others contribute to the discussion.',
  },
  {
    participantId: 3,
    action: 'speak',
    message: 'We should also consider multilingual AI accessibility.',
    thinking: 'Bringing up another important aspect of accessibility.',
  },
  {
    participantId: 4,
    action: 'toggleCamera',
    thinking: 'Returning to the discussion with video.',
  },
  {
    participantId: 2,
    action: 'speak',
    message:
      'These are all excellent points for creating an inclusive AI future.',
    thinking: 'Summarizing the key points of our discussion.',
  },
]
