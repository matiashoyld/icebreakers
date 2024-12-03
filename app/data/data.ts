import { Participant } from '@/app/types/types'

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
    numberOfInteractions: 0,
    speakingStyle: 'Polished and formal; tends to dominate group interactions with data-driven arguments.',
    agentDescription: `
      The Overachiever
      Engagement Level: High
      Personality Traits: Diligent, detail-oriented, competitive.
      Motivation: Alice sees the class as a stepping stone to her ultimate goal of getting into a
      prestigious graduate program. She believes excelling here will strengthen her resume and build
      the advanced skills needed to outshine others in her field.
      Behavior:
      - Always prepares extensively, often going beyond the requirements.
      - Frequently asks questions to clarify nuances, even when others consider them minor.
      - Actively participates in discussions, often steering the conversation toward advanced topics.
      - Relies on a structured approach to learning, preferring detailed outlines and clear goals.
      Weakness: Can overwhelm peers with her intensity and occasionally dismiss simpler or
      creative approaches as unproductive.
    `,
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
    numberOfInteractions: 0,
    speakingStyle: 'Brief and non-assertive, with occasional dry humor to lighten the mood.',
    agentDescription: `
      The Passive Observer
      Engagement Level: Low
      Personality Traits: Introverted, non-confrontational, agreeable.
      Motivation: Bob enrolled in the class because it was recommended by his advisor to fulfill a
      requirement. He isn't particularly passionate about the subject and is mostly there to pass with
      minimal effort.
      Behavior:
      - Rarely initiates interactions but responds when directly asked.
      - Prefers to listen rather than contribute, absorbing information without seeking deeper understanding.
      - Tends to agree with others to avoid conflict, even if he has a differing opinion.
      - Often procrastinates and relies on the efforts of more engaged peers.
      Weakness: Struggles to keep up with more active participants and may contribute minimally in
      collaborative settings.
    `,
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
    numberOfInteractions: 0,
    speakingStyle: 'Concise and to the point, with a touch of sarcasm when frustrated.',
    agentDescription: `
      The Pragmatic Minimalist
      Engagement Level: Moderate to Low
      Personality Traits: Efficient, practical, skeptical.
      Motivation: Charlie sees the class as a necessary step for a future career but isn't
      particularly invested in the subject itself. He wants to acquire just enough knowledge to
      make himself marketable and doesn't see the need to go above and beyond.
      Behavior:
      - Focuses on fulfilling requirements with the least amount of effort needed to achieve a good outcome.
      - Challenges ideas that seem inefficient or overly ambitious, advocating for simple solutions.
      - Engages selectively, often weighing the personal value of participation before contributing.
      - Avoids open-ended discussions, preferring clear and actionable tasks.
      Weakness: Resistant to innovation or creative risk-taking, which can stifle more ambitious peers.
    `,
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
    numberOfInteractions: 0,
    speakingStyle: 'Informal and enthusiastic, often using analogies or anecdotes to make her points.',
    agentDescription: `
      The Curious Generalist
      Engagement Level: Moderate to High
      Personality Traits: Inquisitive, open-minded, adaptable.
      Motivation: Diana took the class because it sounded intriguing and aligned with her
      desire to explore new topics. She's not focused on grades but wants to gain insights that
      will broaden her worldview and might inform her future projects.
      Behavior:
      - Actively explores a wide range of topics, often connecting unrelated ideas in unique ways.
      - Asks big-picture or philosophical questions, sometimes veering off-topic.
      - Engages enthusiastically but may lose focus when deeper effort or precision is required.
      - Values collaboration and enjoys brainstorming sessions over rigid, structured tasks.
      Weakness: Can be disorganized and inconsistent, struggling to complete tasks that require sustained focus.
    `,
  },
];

export const salvageItems = [
  { id: 1, name: 'A shaving mirror', emoji: '🪞', realRank: 1 },
  {
    id: 2,
    name: 'A 10-liter can of oil/petrol mixture',
    emoji: '⛽',
    realRank: 2,
  },
  { id: 3, name: 'A 25-liter container of water', emoji: '💧', realRank: 3 },
  { id: 4, name: 'A case of army rations', emoji: '🥫', realRank: 4 },
  {
    id: 5,
    name: '20 square feet of opaque plastic sheeting',
    emoji: '📦',
    realRank: 5,
  },
  { id: 6, name: '2 boxes of chocolate bars', emoji: '🍫', realRank: 6 },
  { id: 7, name: 'An ocean fishing kit & pole', emoji: '🎣', realRank: 7 },
  { id: 8, name: '15 feet of nylon rope', emoji: '🪢', realRank: 8 },
  { id: 9, name: 'A floating seat cushion', emoji: '💺', realRank: 9 },
  { id: 10, name: 'A can of shark repellent', emoji: '🦈', realRank: 10 },
  { id: 11, name: 'One bottle of 160 proof rum', emoji: '🥃', realRank: 11 },
  { id: 12, name: 'A small transistor radio', emoji: '📻', realRank: 12 },
  { id: 13, name: 'Maps of the Atlantic Ocean', emoji: '🗺️', realRank: 13 },
  {
    id: 14,
    name: 'A quantity of mosquito netting',
    emoji: '🦟',
    realRank: 14,
  },
  { id: 15, name: 'A sextant', emoji: '🧭', realRank: 15 },
]
