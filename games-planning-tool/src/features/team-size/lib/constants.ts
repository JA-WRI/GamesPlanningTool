import type { TeamSize } from './teamSizeLogic';

const currentYear = new Date().getFullYear();

// allowed years: this year to 10 years ahead
// TODO: get this from the Games planning dates later
export const ALLOWED_YEAR_RANGE = {
  min: currentYear,
  max: currentYear + 10,
};

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
