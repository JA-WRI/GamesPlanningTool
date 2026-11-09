// AI contribution: 50% or more AI-generated
import { INITIAL_TEAM_SIZE } from '@/features/team-size/lib/constants';
import type { TeamSize } from '@/features/team-size/lib/teamSizeLogic';
import type { DisciplineBreakdown } from '@/features/team-size/lib/teamSizeGridLogic';

// example Team Size data from the mockup, used by the tests
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
    { id: 'hp', label: 'HP', bestF: 4, bestM: 3, lowF: 3, lowM: 3 },
    { id: 'ssba', label: 'SS/BA', bestF: 4, bestM: 3, lowF: 3, lowM: 3 },
    { id: 'ae', label: 'AE', bestF: 2, bestM: 3, lowF: 1, lowM: 3 },
    { id: 'mo', label: 'MO', bestF: 3, bestM: 3, lowF: 3, lowM: 3 },
  ],
  notes:
    'Likely to qualify a Mixed Aerial Team, bringing the total team to 32 (with SX).',
};
