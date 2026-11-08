// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  INITIAL_TEAM_SIZE,
  MOCK_DISCIPLINES,
  MOCK_MEDAL_ROWS,
  MOCK_TEAM_SIZE,
} from '@/features/team-size/lib/mockData';
import {
  GridNumber,
  MAX_COUNT,
  TeamSizeRow,
  allWholeCounts,
  isWholeCount,
  MedalObjectiveRow,
  medalRowHasError,
  medalsToRows,
  rowsToMedals,
  athletesToRows,
  createEmptyMedalRow,
  disciplineHasLowAboveBest,
  gendersWithRangeError,
  rowsMissingName,
  rowsToAthletes,
  toGridNumber,
  toText,
} from '@/features/team-size/lib/teamSizeGridLogic';

// one "Low" row with these male and female counts
function row(male: GridNumber, female: GridNumber): TeamSizeRow {
  return { id: 'low', label: 'Low', male, female };
}

const LEVELS = ['low', 'bestGuess', 'high'] as const;

// Low, Best Guess, High rows from [low, best, high] for each gender
function estimateRows(
  male: GridNumber[],
  female: GridNumber[] = ['', '', ''],
): TeamSizeRow[] {
  return LEVELS.map((id, i) => ({
    id,
    label: id,
    male: male[i],
    female: female[i],
  }));
}

describe('toGridNumber', () => {
  it('turns text into a number', () => {
    expect(toGridNumber('12')).toBe(12);
    expect(toGridNumber('0')).toBe(0);
  });

  it('keeps an empty box empty', () => {
    expect(toGridNumber('')).toBe('');
  });
});

describe('toText', () => {
  it('turns a number into text', () => {
    expect(toText(12)).toBe('12');
    expect(toText(0)).toBe('0');
  });

  it('keeps an empty box empty', () => {
    expect(toText('')).toBe('');
    expect(toText(undefined)).toBe('');
  });
});

describe('athletesToRows', () => {
  it('makes a Low, a Best Guess and a High row', () => {
    const rows = athletesToRows(INITIAL_TEAM_SIZE.athletes);
    expect(rows.map((r) => r.label)).toEqual(['Low', 'Best Guess', 'High']);
    expect(rows[0]).toEqual({ id: 'low', label: 'Low', male: '', female: '' });
  });

  it('puts each gender in its own column, as numbers', () => {
    const athletes = {
      male: { low: '12', bestGuess: '12', high: '16' },
      female: { low: '10', bestGuess: '', high: '13' },
    };
    const [low, best, high] = athletesToRows(athletes);
    expect(low).toMatchObject({ male: 12, female: 10 });
    expect(best.female).toBe('');
    expect(high.male).toBe(16);
  });
});

describe('rowsToAthletes', () => {
  it('turns the grid rows back into text for each gender', () => {
    const athletes = rowsToAthletes(estimateRows([1, '', 3], [4, 5, 6]));
    expect(athletes.male).toEqual({ low: '1', bestGuess: '', high: '3' });
    expect(athletes.female).toEqual({ low: '4', bestGuess: '5', high: '6' });
  });

  it('round-trips without losing values', () => {
    const athletes = {
      male: { low: '1', bestGuess: '2', high: '3' },
      female: { low: '', bestGuess: '5', high: '' },
    };
    expect(rowsToAthletes(athletesToRows(athletes))).toEqual(athletes);
  });

  it('leaves a level empty when its row is missing', () => {
    const athletes = rowsToAthletes([row(4, 7)]);
    expect(athletes.male).toEqual({ low: '4', bestGuess: '', high: '' });
    expect(athletes.female.low).toBe('7');
  });
});

describe('gendersWithRangeError', () => {
  it('is empty when Low ≤ Best ≤ High for both genders', () => {
    expect(gendersWithRangeError(estimateRows([1, 2, 3], [5, 5, 5]))).toEqual(
      [],
    );
  });

  it('finds Male when its Low > Best', () => {
    expect(gendersWithRangeError(estimateRows([5, 4, 9]))).toEqual(['Male']);
  });

  it('finds Female when its Best > High', () => {
    expect(gendersWithRangeError(estimateRows([], [1, 6, 5]))).toEqual([
      'Female',
    ]);
  });

  it('finds both genders at once', () => {
    expect(gendersWithRangeError(estimateRows([9, '', 1], [3, 2, 1]))).toEqual([
      'Male',
      'Female',
    ]);
  });

  it('is empty when the boxes are empty', () => {
    expect(gendersWithRangeError(estimateRows(['', '', '']))).toEqual([]);
  });
});

describe('createEmptyMedalRow', () => {
  it('starts with blank values', () => {
    const medalRow = createEmptyMedalRow();
    expect(medalRow).toMatchObject({
      firstName: '',
      lastName: '',
      event: '',
      medalPotential: '',
      notes: '',
    });
  });

  it('gives every row a different id', () => {
    expect(createEmptyMedalRow().id).not.toBe(createEmptyMedalRow().id);
  });
});

describe('isWholeCount', () => {
  it('accepts an empty box', () => {
    expect(isWholeCount('')).toBe(true);
  });

  it('accepts whole numbers from 0 to 999', () => {
    expect(isWholeCount(0)).toBe(true);
    expect(isWholeCount(12)).toBe(true);
    expect(isWholeCount(MAX_COUNT)).toBe(true);
  });

  it('rejects decimals', () => {
    expect(isWholeCount(2.5)).toBe(false);
    expect(isWholeCount(0.1)).toBe(false);
  });

  it('rejects negative numbers', () => {
    expect(isWholeCount(-1)).toBe(false);
  });

  it('rejects numbers over 999', () => {
    expect(isWholeCount(1000)).toBe(false);
    expect(isWholeCount(1e21)).toBe(false);
  });

  it('rejects text', () => {
    expect(isWholeCount('12')).toBe(false);
    expect(isWholeCount('abc')).toBe(false);
  });
});

describe('allWholeCounts', () => {
  const fields: (keyof TeamSizeRow)[] = ['male', 'female'];

  it('is true when every box is fine', () => {
    expect(allWholeCounts([row(1, 2), row('', '')], fields)).toBe(true);
  });

  it('is false when one box has a decimal', () => {
    expect(allWholeCounts([row(1, 2), row(1, 2.5)], fields)).toBe(false);
  });

  it('only checks the given columns', () => {
    expect(allWholeCounts([row(1, 2.5)], ['male'])).toBe(true);
  });

  it('is true when there are no rows', () => {
    expect(allWholeCounts([], fields)).toBe(true);
  });
});

describe('rowsMissingName', () => {
  const named = MOCK_MEDAL_ROWS[0];

  it('is empty when every athlete has both names', () => {
    expect(rowsMissingName(MOCK_MEDAL_ROWS)).toEqual([]);
  });

  it('finds an athlete with no first name', () => {
    const noFirst = { ...named, id: 'x', firstName: '' };
    expect(rowsMissingName([named, noFirst])).toEqual([noFirst]);
  });

  it('finds an athlete with no last name', () => {
    const noLast = { ...named, id: 'y', lastName: '' };
    expect(rowsMissingName([noLast])).toEqual([noLast]);
  });

  it('counts a name with only spaces as missing', () => {
    const spaces = { ...named, firstName: '   ' };
    expect(rowsMissingName([spaces])).toEqual([spaces]);
  });

  it('finds a new blank athlete', () => {
    expect(rowsMissingName([createEmptyMedalRow()])).toHaveLength(1);
  });

  it('is empty when there are no athletes', () => {
    expect(rowsMissingName([])).toEqual([]);
  });
});

describe('gendersWithRangeError edge cases', () => {
  it('is empty when Low is 0 and the others are bigger', () => {
    expect(gendersWithRangeError(estimateRows([0, 3, 5]))).toEqual([]);
  });

  it('finds the gender when Best is 0 but Low is bigger', () => {
    expect(gendersWithRangeError(estimateRows([2, 0, 5]))).toEqual(['Male']);
  });

  it('compares negative numbers correctly', () => {
    expect(gendersWithRangeError(estimateRows([-5, -2, 0]))).toEqual([]);
    expect(gendersWithRangeError(estimateRows([-1, -2, 0]))).toEqual(['Male']);
  });
});

describe('disciplineHasLowAboveBest', () => {
  const hp = MOCK_DISCIPLINES.rows[0];

  it('is false when Low ≤ Best for women and men', () => {
    expect(disciplineHasLowAboveBest(hp)).toBe(false);
  });

  it('is false when Low equals Best', () => {
    expect(
      disciplineHasLowAboveBest({
        ...hp,
        bestF: 3,
        lowF: 3,
        bestM: 0,
        lowM: 0,
      }),
    ).toBe(false);
  });

  it('is true when Low · F is above Best · F', () => {
    expect(disciplineHasLowAboveBest({ ...hp, bestF: 6, lowF: 7 })).toBe(true);
  });

  it('is true when Low · M is above Best · M', () => {
    expect(disciplineHasLowAboveBest({ ...hp, bestM: 1, lowM: 2 })).toBe(true);
  });

  it('compares as numbers ("10" is above "9")', () => {
    expect(disciplineHasLowAboveBest({ ...hp, bestF: 9, lowF: 10 })).toBe(true);
  });

  it('does not check when a box is empty', () => {
    expect(disciplineHasLowAboveBest({ ...hp, bestF: '', lowF: 7 })).toBe(
      false,
    );
    expect(disciplineHasLowAboveBest({ ...hp, bestM: 3, lowM: '' })).toBe(
      false,
    );
  });

  it('has no errors in the mock data', () => {
    expect(MOCK_DISCIPLINES.rows.some(disciplineHasLowAboveBest)).toBe(false);
  });
});

function medalRow(low: number | '', high: number | ''): MedalObjectiveRow {
  return { id: 'medals', label: 'Projected medals', low, high };
}

describe('medalsToRows', () => {
  it('makes one "Projected medals" row with numbers', () => {
    expect(medalsToRows(MOCK_TEAM_SIZE)).toEqual([medalRow(2, 5)]);
  });

  it('keeps empty boxes empty', () => {
    expect(medalsToRows(INITIAL_TEAM_SIZE)).toEqual([medalRow('', '')]);
  });
});

describe('rowsToMedals', () => {
  it('turns the numbers back into text in the team size', () => {
    const result = rowsToMedals([medalRow(3, 7)], MOCK_TEAM_SIZE);
    expect(result.projectedMedalsLow).toBe('3');
    expect(result.projectedMedalsHigh).toBe('7');
  });

  it('keeps empty boxes as empty text', () => {
    const result = rowsToMedals([medalRow('', 4)], MOCK_TEAM_SIZE);
    expect(result.projectedMedalsLow).toBe('');
    expect(result.projectedMedalsHigh).toBe('4');
  });

  it('does not change the rest of the team size', () => {
    const result = rowsToMedals([medalRow(3, 7)], MOCK_TEAM_SIZE);
    expect(result.athletes).toEqual(MOCK_TEAM_SIZE.athletes);
    expect(result.notes).toBe(MOCK_TEAM_SIZE.notes);
  });

  it('round-trips without losing values', () => {
    expect(rowsToMedals(medalsToRows(MOCK_TEAM_SIZE), MOCK_TEAM_SIZE)).toEqual(
      MOCK_TEAM_SIZE,
    );
  });

  it('returns the team size unchanged when there is no row', () => {
    expect(rowsToMedals([], MOCK_TEAM_SIZE)).toBe(MOCK_TEAM_SIZE);
  });
});

describe('medalRowHasError', () => {
  it('is false when Low ≤ High', () => {
    expect(medalRowHasError(medalRow(2, 5))).toBe(false);
    expect(medalRowHasError(medalRow(3, 3))).toBe(false);
  });

  it('is true when Low > High', () => {
    expect(medalRowHasError(medalRow(5, 2))).toBe(true);
  });

  it('compares as numbers ("10" is above "9")', () => {
    expect(medalRowHasError(medalRow(10, 9))).toBe(true);
  });

  it('does not check when a box is empty', () => {
    expect(medalRowHasError(medalRow('', 2))).toBe(false);
    expect(medalRowHasError(medalRow(5, ''))).toBe(false);
  });
});
