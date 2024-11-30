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

export const salvageItems = [
  { id: 1, name: 'A sextant', emoji: '🧭', initialRank: 1 },
  { id: 2, name: 'A shaving mirror', emoji: '🪞', initialRank: 2 },
  {
    id: 3,
    name: 'A quantity of mosquito netting',
    emoji: '🦟',
    initialRank: 3,
  },
  { id: 4, name: 'A 25-liter container of water', emoji: '💧', initialRank: 4 },
  { id: 5, name: 'A case of army rations', emoji: '🥫', initialRank: 5 },
  { id: 6, name: 'Maps of the Atlantic Ocean', emoji: '🗺️', initialRank: 6 },
  { id: 7, name: 'A floating seat cushion', emoji: '💺', initialRank: 7 },
  {
    id: 8,
    name: 'A 10-liter can of oil/petrol mixture',
    emoji: '⛽',
    initialRank: 8,
  },
  { id: 9, name: 'A small transistor radio', emoji: '📻', initialRank: 9 },
  {
    id: 10,
    name: '20 square feet of opaque plastic sheeting',
    emoji: '📦',
    initialRank: 10,
  },
  { id: 11, name: 'A can of shark repellent', emoji: '🦈', initialRank: 11 },
  { id: 12, name: 'One bottle of 160 proof rum', emoji: '🥃', initialRank: 12 },
  { id: 13, name: '15 feet of nylon rope', emoji: '🪢', initialRank: 13 },
  { id: 14, name: '2 boxes of chocolate bars', emoji: '🍫', initialRank: 14 },
  { id: 15, name: 'An ocean fishing kit & pole', emoji: '🎣', initialRank: 15 },
]
