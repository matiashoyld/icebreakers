import { Participant } from '@/app/types/types'

/**
 * Initial participants in the simulation.
 */
export const initialParticipants: Participant[] = [
  {
    id: 1,
    name: 'Alice',
    avatar: '/images/alice.gif',
    description: 'A friendly and outgoing software engineer who loves to discuss new technologies. She has 5 years of experience in web development and enjoys mentoring others.',
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
    description: 'A thoughtful product manager with a background in UX design. He tends to think before speaking and likes to ensure everyone gets a chance to contribute.',
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
    description: 'An enthusiastic data scientist who recently joined the team. He\'s eager to learn from others but sometimes gets carried away in technical discussions.',
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
    description: 'A senior project lead with 10 years of experience. She\'s direct in her communication style and good at keeping discussions on track.',
    cameraOn: true,
    wordsSpoken: 0,
    timesDoingNothing: 0,
    cameraToggles: 0,
    participationRate: 0,
  },
]
