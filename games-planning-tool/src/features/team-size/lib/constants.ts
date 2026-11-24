import type { TeamSize } from './teamSizeLogic';

// empty Team Size page, used when nothing is saved yet
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
