// AI contribution: 50% or more AI-generated
import type { TeamSize } from './teamSizeLogic';
import type { DisciplineBreakdown, MedalRow } from './teamSizeGridLogic';

export const PARTICIPANT_CATEGORIES = [
  'Athlete',
  'Team Leader',
  'Team Manager',
  'Coach',
  'Physician',
  'Physiotherapist',
  'Strength and Conditioning',
  'Wax Technician',
  'Mental Performance Consultant',
  'Media Attaché',
  'Mission Staff Support',
  'NSO Leadership',
  'Guest',
];

// placeholder types until we get the real list
export const ACCREDITATION_TYPES = ['A', 'B', 'C', 'D'];

export const INITIAL_TEAM_SIZE: TeamSize = {
  athletes: {
    male: {
      low: '',
      bestGuess: '',
      high: '',
    },
    female: {
      low: '',
      bestGuess: '',
      high: '',
    },
  },
  staff: '',
  notes: '',
  projectedMedalsLow: '',
  projectedMedalsHigh: '',
};

// example values from the mockup(until the backend is ready)
export const MOCK_TEAM_SIZE: TeamSize = {
  ...INITIAL_TEAM_SIZE,
  athletes: {
    male: { low: '12', bestGuess: '12', high: '16' },
    female: { low: '10', bestGuess: '13', high: '13' },
  },
  notes:
    "This best guess takes us to 23 (there will be 24, but this year's results will decide who moves up a tier). I can update mid-December with a more realistic guess.",
  projectedMedalsLow: '2',
  projectedMedalsHigh: '5',
};

export const MOCK_DISCIPLINES: DisciplineBreakdown = {
  rows: [
    { id: 'hp', label: 'HP', bestF: 4, bestM: 3, lowF: 4, lowM: 2 },
    { id: 'ssba', label: 'SS/BA', bestF: 4, bestM: 3, lowF: 4, lowM: 2 },
    { id: 'ae', label: 'AE', bestF: 1, bestM: 4, lowF: 1, lowM: 3 },
    { id: 'mo', label: 'MO', bestF: 3, bestM: 3, lowF: 3, lowM: 2 },
  ],
  notes:
    'Likely to qualify a Mixed Aerial Team, bringing the total team to 32 (with SX).',
};

// made-up athletes, not real people
const athlete = (
  id: string,
  firstName: string,
  lastName: string,
  event: string,
  medalPotential: MedalRow['medalPotential'],
  notes = '',
): MedalRow => ({ id, firstName, lastName, event, medalPotential, notes });

export const MOCK_MEDAL_ROWS: MedalRow[] = [
  athlete(
    'athlete-1',
    'Alex',
    'Martin',
    'Moguls, Dual Moguls',
    'SP – Method A',
  ),
  athlete('athlete-2', 'Sophie', 'Tremblay', 'Moguls, Dual Moguls', 'SP'),
  athlete('athlete-3', 'Liam', 'Gagnon', 'Halfpipe', 'MP', 'New'),
  athlete('athlete-4', 'Emma', 'Roy', 'Slopestyle, Big Air', 'LP', 'Alternate'),
];
