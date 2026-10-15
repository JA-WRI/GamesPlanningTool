// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  INITIAL_TEAM_SIZE,
  MOCK_DISCIPLINES,
  MOCK_MEDAL_ROWS,
  MOCK_TEAM_SIZE,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/mockData';
import {
  MAX_COUNT,
  TeamSizeRow,
  allWholeCounts,
  isWholeCount,
  athletesToRows,
  createEmptyMedalRow,
  disciplineHasLowAboveBest,
  rowHasRangeError,
  rowToEstimate,
  rowsMissingName,
  rowsToAthletes,
  sumColumn,
  toGridNumber,
  toText,
  withBlankNotes,
  withDisciplineLabels,
  withFixedLabels,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/teamSizeGridLogic';

function row(
  low: number | '',
  bestGuess: number | '',
  high: number | '',
): TeamSizeRow {
  return { id: 'male', label: 'Male', low, bestGuess, high };
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

describe('sumColumn', () => {
  it('adds one column from top to bottom', () => {
    const rows = [row(12, 12, 16), row(10, 13, 13)];
    expect(sumColumn(rows, 'low')).toBe(22);
    expect(sumColumn(rows, 'bestGuess')).toBe(25);
    expect(sumColumn(rows, 'high')).toBe(29);
  });

  it('counts empty boxes as 0', () => {
    expect(sumColumn([row('', 3, ''), row(2, '', '')], 'low')).toBe(2);
  });

  it('is 0 when there are no rows', () => {
    expect(sumColumn<TeamSizeRow>([], 'low')).toBe(0);
  });
});

describe('athletesToRows', () => {
  it('makes a Male and a Female row', () => {
    const rows = athletesToRows(INITIAL_TEAM_SIZE.athletes);
    expect(rows.map((r) => r.label)).toEqual(['Male', 'Female']);
    expect(rows[0]).toEqual({
      id: 'male',
      label: 'Male',
      low: '',
      bestGuess: '',
      high: '',
    });
  });

  it('turns the text values into numbers', () => {
    const athletes = {
      male: { low: '12', bestGuess: '12', high: '16' },
      female: { low: '10', bestGuess: '', high: '13' },
    };
    const [male, female] = athletesToRows(athletes);
    expect(male.high).toBe(16);
    expect(female.bestGuess).toBe('');
  });
});

describe('rowToEstimate', () => {
  it('turns a grid row back into text values', () => {
    expect(rowToEstimate(row(1, '', 3))).toEqual({
      low: '1',
      bestGuess: '',
      high: '3',
    });
  });
});

describe('rowsToAthletes', () => {
  it('updates the team size state from the grid rows', () => {
    const rows = athletesToRows(INITIAL_TEAM_SIZE.athletes);
    rows[1] = { ...rows[1], bestGuess: 13 };
    const athletes = rowsToAthletes(rows, INITIAL_TEAM_SIZE.athletes);
    expect(athletes.female.bestGuess).toBe('13');
    expect(athletes.male).toEqual(INITIAL_TEAM_SIZE.athletes.male);
  });

  it('round-trips without losing values', () => {
    const athletes = {
      male: { low: '1', bestGuess: '2', high: '3' },
      female: { low: '', bestGuess: '5', high: '' },
    };
    expect(rowsToAthletes(athletesToRows(athletes), athletes)).toEqual(
      athletes,
    );
  });

  it('does not change the original object', () => {
    const rows = [row(4, 4, 4)];
    rowsToAthletes(rows, INITIAL_TEAM_SIZE.athletes);
    expect(INITIAL_TEAM_SIZE.athletes.male.low).toBe('');
  });
});

describe('rowHasRangeError', () => {
  it('is false when Low ≤ Best ≤ High', () => {
    expect(rowHasRangeError(row(1, 2, 3))).toBe(false);
    expect(rowHasRangeError(row(5, 5, 5))).toBe(false);
  });

  it('is true when Low > Best', () => {
    expect(rowHasRangeError(row(5, 4, 9))).toBe(true);
  });

  it('is true when Best > High', () => {
    expect(rowHasRangeError(row(1, 6, 5))).toBe(true);
  });

  it('is true when Low > High and Best is empty', () => {
    expect(rowHasRangeError(row(9, '', 1))).toBe(true);
  });

  it('is false when the boxes are empty', () => {
    expect(rowHasRangeError(row('', '', ''))).toBe(false);
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

describe('withFixedLabels', () => {
  it('puts the row names back after a user types over them', () => {
    const rows = athletesToRows(INITIAL_TEAM_SIZE.athletes);
    rows[0] = { ...rows[0], label: 'oops' };
    expect(withFixedLabels(rows).map((r) => r.label)).toEqual([
      'Male',
      'Female',
    ]);
  });

  it('keeps the numbers as they are', () => {
    const fixed = withFixedLabels([{ ...row(1, 2, 3), label: '' }]);
    expect(fixed[0]).toEqual(row(1, 2, 3));
  });
});

describe('withDisciplineLabels', () => {
  it('puts the discipline names back after a user types over them', () => {
    const rows = MOCK_DISCIPLINES.rows.map((r) => ({ ...r, label: 'x' }));
    expect(withDisciplineLabels(rows).map((r) => r.label)).toEqual([
      'HP',
      'SS/BA',
      'AE',
      'MO',
    ]);
  });

  it('keeps the numbers as they are', () => {
    const [hp] = withDisciplineLabels(MOCK_DISCIPLINES.rows);
    expect(hp).toEqual(MOCK_DISCIPLINES.rows[0]);
  });
});

describe('withBlankNotes', () => {
  it('turns an empty note into a space so the grid shows nothing', () => {
    expect(withBlankNotes(MOCK_MEDAL_ROWS)[0].notes).toBe(' ');
  });

  it('keeps real notes as they are', () => {
    expect(withBlankNotes(MOCK_MEDAL_ROWS)[2].notes).toBe('New');
  });

  it('does not change the original rows', () => {
    withBlankNotes(MOCK_MEDAL_ROWS);
    expect(MOCK_MEDAL_ROWS[0].notes).toBe('');
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
  const fields: (keyof TeamSizeRow)[] = ['low', 'bestGuess', 'high'];

  it('is true when every box is fine', () => {
    expect(allWholeCounts([row(1, 2, 3), row('', '', '')], fields)).toBe(true);
  });

  it('is false when one box has a decimal', () => {
    expect(allWholeCounts([row(1, 2, 3), row(1, 2.5, 3)], fields)).toBe(false);
  });

  it('only checks the given columns', () => {
    expect(allWholeCounts([row(1, 2.5, 3)], ['low', 'high'])).toBe(true);
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

describe('mock discipline data', () => {
  const { male, female } = MOCK_TEAM_SIZE.athletes;
  const rows = MOCK_DISCIPLINES.rows;

  it('adds up to the team size best guess', () => {
    expect(sumColumn(rows, 'bestF')).toBe(Number(female.bestGuess));
    expect(sumColumn(rows, 'bestM')).toBe(Number(male.bestGuess));
  });

  it('adds up to the team size low estimate', () => {
    expect(sumColumn(rows, 'lowF')).toBe(Number(female.low));
    expect(sumColumn(rows, 'lowM')).toBe(Number(male.low));
  });

  it('never has Low above Best for a discipline', () => {
    rows.forEach((r) => {
      expect(r.lowF).toBeLessThanOrEqual(r.bestF as number);
      expect(r.lowM).toBeLessThanOrEqual(r.bestM as number);
    });
  });
});

describe('sumColumn edge cases', () => {
  it('adds negative numbers as they are', () => {
    expect(sumColumn([row(-3, 0, 0), row(5, 0, 0)], 'low')).toBe(2);
  });

  it('handles very large numbers', () => {
    expect(sumColumn([row(999, 0, 0), row(999, 0, 0)], 'low')).toBe(1998);
  });

  it('can give a long decimal, which is why decimals are blocked', () => {
    expect(sumColumn([row(0.1, 0, 0), row(0.2, 0, 0)], 'low')).not.toBe(0.3);
  });
});

describe('rowHasRangeError edge cases', () => {
  it('is false when Low is 0 and the others are bigger', () => {
    expect(rowHasRangeError(row(0, 3, 5))).toBe(false);
  });

  it('is true when Best is 0 but Low is bigger', () => {
    expect(rowHasRangeError(row(2, 0, 5))).toBe(true);
  });

  it('compares negative numbers correctly', () => {
    expect(rowHasRangeError(row(-5, -2, 0))).toBe(false);
    expect(rowHasRangeError(row(-1, -2, 0))).toBe(true);
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
