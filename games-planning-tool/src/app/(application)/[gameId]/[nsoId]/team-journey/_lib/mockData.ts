// 55% AI generated to create the mock data
import type { TeamSize } from './teamSizeLogic';

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
    'This best guess takes us to 23 (there will be 24 but the results from this year will have a huge impact on who moves up a tier of selection). I can update mid-December with a much more realistic guess. Likely to qualify a Mixed Aerial Team, bringing the total team to 32 (with SX).',
};
