import type { TeamSize } from '../_components/TeamSizeStep';

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
