// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  INITIAL_TEAM_SIZE,
  MOCK_DISCIPLINES,
  MOCK_MEDAL_ROWS,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/mockData';
import {
  TeamSizeRow,
  athletesToRows,
  createEmptyMedalRow,
  rowHasRangeError,
  rowToEstimate,
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
