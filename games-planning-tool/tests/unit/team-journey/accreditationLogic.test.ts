import { describe, it, expect } from 'vitest';
import { ALLOWED_YEAR_RANGE } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/constants';
import {
  addAccreditationRow,
  clearFinishedDateBoxes,
  createEmptyAccreditationRow,
  deleteAccreditationRow,
  getDateMessage,
  getRowErrors,
  updateAccreditationRow,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/accreditationLogic';
import {
  allInvalidParts,
  emptyDate,
  noInvalidParts,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/dateLogic';

const year = String(ALLOWED_YEAR_RANGE.min);
const tooLateYear = String(ALLOWED_YEAR_RANGE.max + 1);

function date(day: string, month: string, y: string) {
  return { day, month, year: y };
}

describe('createEmptyAccreditationRow', () => {
  it('creates an empty row with the given id', () => {
    expect(createEmptyAccreditationRow(3)).toEqual({
      id: 3,
      participantCategory: '',
      accreditationType: '',
      quantity: '',
      startDate: emptyDate,
      endDate: emptyDate,
      notes: '',
    });
  });
});

describe('addAccreditationRow', () => {
  it('adds an empty row at the end with the next id', () => {
    const rows = [1, 2].map(createEmptyAccreditationRow);
    const result = addAccreditationRow(rows);
    expect(result).toHaveLength(3);
    expect(result[2]).toEqual(createEmptyAccreditationRow(3));
  });

  it('starts at id 1 when there are no rows', () => {
    expect(addAccreditationRow([])).toEqual([createEmptyAccreditationRow(1)]);
  });

  it('uses the biggest id + 1 (even after a delete in the middle)', () => {
    const rows = [1, 5].map(createEmptyAccreditationRow);
    expect(addAccreditationRow(rows)[2].id).toBe(6);
  });

  it('does not change the original list', () => {
    const rows = [createEmptyAccreditationRow(1)];
    addAccreditationRow(rows);
    expect(rows).toHaveLength(1);
  });
});

describe('updateAccreditationRow', () => {
  it('changes only the row with that id', () => {
    const rows = [1, 2].map(createEmptyAccreditationRow);
    const result = updateAccreditationRow(rows, 2, { quantity: '7' });
    expect(result[1].quantity).toBe('7');
    expect(result[0]).toEqual(rows[0]);
  });

  it('can change several fields at once', () => {
    const rows = [createEmptyAccreditationRow(1)];
    const result = updateAccreditationRow(rows, 1, {
      participantCategory: 'Coach',
      accreditationType: 'A',
    });
    expect(result[0].participantCategory).toBe('Coach');
    expect(result[0].accreditationType).toBe('A');
  });

  it('changes nothing when the id does not exist', () => {
    const rows = [createEmptyAccreditationRow(1)];
    expect(updateAccreditationRow(rows, 99, { quantity: '7' })).toEqual(rows);
  });

  it('does not change the original list', () => {
    const rows = [createEmptyAccreditationRow(1)];
    updateAccreditationRow(rows, 1, { quantity: '7' });
    expect(rows[0].quantity).toBe('');
  });
});

describe('deleteAccreditationRow', () => {
  it('removes the row with that id', () => {
    const rows = [1, 2, 3].map(createEmptyAccreditationRow);
    const result = deleteAccreditationRow(rows, 2);
    expect(result.map((row) => row.id)).toEqual([1, 3]);
  });

  it('can remove the last row', () => {
    const rows = [createEmptyAccreditationRow(1)];
    expect(deleteAccreditationRow(rows, 1)).toEqual([]);
  });

  it('changes nothing when the id does not exist', () => {
    const rows = [1, 2].map(createEmptyAccreditationRow);
    expect(deleteAccreditationRow(rows, 99)).toEqual(rows);
  });
});

describe('clearFinishedDateBoxes', () => {
  it('resets the start and end boxes of that row only', () => {
    const finished = { '1-start': true, '1-end': true, '2-start': true };
    expect(clearFinishedDateBoxes(finished, 1)).toEqual({
      '1-start': false,
      '1-end': false,
      '2-start': true,
    });
  });
});

describe('getDateMessage', () => {
  it('returns null for an empty or valid date', () => {
    expect(getDateMessage('Start', emptyDate, true)).toBeNull();
    expect(getDateMessage('Start', date('01', '01', year), true)).toBeNull();
  });

  it('says the date does not exist', () => {
    expect(getDateMessage('Start', date('31', '02', year), false)).toBe(
      'Start does not exist.',
    );
  });

  it('says the year is out of range', () => {
    expect(getDateMessage('Start', date('01', '01', tooLateYear), false)).toBe(
      `Start year must be between ${ALLOWED_YEAR_RANGE.min} and ${ALLOWED_YEAR_RANGE.max}.`,
    );
  });

  it('only says "incomplete" after the user left the field', () => {
    const halfDate = date('08', '07', '');
    expect(getDateMessage('Start', halfDate, false)).toBeNull();
    expect(getDateMessage('Start', halfDate, true)).toBe(
      'Start is incomplete, use DD / MM / YYYY.',
    );
  });
});

describe('getRowErrors', () => {
  it('has no errors for an empty row', () => {
    expect(getRowErrors(createEmptyAccreditationRow(1), {})).toEqual({
      messages: [],
      startInvalidParts: noInvalidParts,
      endInvalidParts: noInvalidParts,
    });
  });

  it('has no errors when end = start (same day is fine)', () => {
    const row = {
      ...createEmptyAccreditationRow(1),
      startDate: date('10', '06', year),
      endDate: date('10', '06', year),
    };
    expect(getRowErrors(row, {}).messages).toEqual([]);
  });

  it('turns the whole end date red when end is before start', () => {
    const row = {
      ...createEmptyAccreditationRow(1),
      startDate: date('10', '06', year),
      endDate: date('09', '06', year),
    };
    expect(getRowErrors(row, {})).toEqual({
      messages: ['Required End Date cannot be before the Required Start Date.'],
      startInvalidParts: noInvalidParts,
      endInvalidParts: allInvalidParts,
    });
  });

  it('marks only the wrong box of a bad start date', () => {
    const row = {
      ...createEmptyAccreditationRow(1),
      startDate: date('31', '04', year),
    };
    expect(getRowErrors(row, {})).toEqual({
      messages: ['Required Start Date does not exist.'],
      startInvalidParts: { day: true, month: false, year: false },
      endInvalidParts: noInvalidParts,
    });
  });

  it('marks only the year of an end date out of range', () => {
    const row = {
      ...createEmptyAccreditationRow(1),
      endDate: date('01', '01', tooLateYear),
    };
    const result = getRowErrors(row, {});
    expect(result.messages).toHaveLength(1);
    expect(result.endInvalidParts).toEqual({
      day: false,
      month: false,
      year: true,
    });
  });

  it('shows incomplete dates only for finished boxes of this row', () => {
    const row = {
      ...createEmptyAccreditationRow(2),
      startDate: date('08', '', ''),
      endDate: date('08', '', ''),
    };
    // another row is finished, not this one
    expect(getRowErrors(row, { '1-start': true }).messages).toEqual([]);
    // only the start of this row is finished
    expect(getRowErrors(row, { '2-start': true })).toEqual({
      messages: ['Required Start Date is incomplete, use DD / MM / YYYY.'],
      startInvalidParts: { day: false, month: true, year: true },
      endInvalidParts: noInvalidParts,
    });
  });

  it('lists start and end errors together', () => {
    const row = {
      ...createEmptyAccreditationRow(1),
      startDate: date('31', '02', year),
      endDate: date('31', '04', year),
    };
    expect(getRowErrors(row, {}).messages).toEqual([
      'Required Start Date does not exist.',
      'Required End Date does not exist.',
    ]);
  });
});
