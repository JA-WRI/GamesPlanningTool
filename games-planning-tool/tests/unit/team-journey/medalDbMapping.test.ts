// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  dbToMedalRows,
  hasMedalRowsShape,
  medalRowsToDb,
} from '@/features/team-size/lib/medalDbMapping';
import { MAX_NOTES_LENGTH } from '@/features/team-size/lib/teamSizeDbMapping';

const ID = '3f2b8c1e-5d4a-4e6f-9a7b-1c2d3e4f5a6b';

// one athlete as it comes from the db
const SAVED_ATHLETE = {
  id: ID,
  event: '100m Freestyle',
  medal: 'MP',
  medalNotes: 'New',
  member: { firstName: 'Alex', lastName: 'Martin' },
};

// the same athlete as a table row
const ROW = {
  id: ID,
  firstName: 'Alex',
  lastName: 'Martin',
  event: '100m Freestyle',
  medalPotential: 'MP' as const,
  notes: 'New',
};

describe('dbToMedalRows', () => {
  it('turns a saved athlete into a table row', () => {
    expect(dbToMedalRows([SAVED_ATHLETE])).toEqual([ROW]);
  });

  it('shows empty boxes when nothing is saved yet', () => {
    const empty = {
      ...SAVED_ATHLETE,
      event: null,
      medal: null,
      medalNotes: null,
    };
    const [row] = dbToMedalRows([empty]);
    expect(row.event).toBe('');
    expect(row.medalPotential).toBe('');
    expect(row.notes).toBe('');
  });

  it('shows an unknown medal value as empty', () => {
    const [row] = dbToMedalRows([{ ...SAVED_ATHLETE, medal: 'Gold' }]);
    expect(row.medalPotential).toBe('');
  });
});

describe('medalRowsToDb', () => {
  it('keeps only the 3 saved columns and the id', () => {
    expect(medalRowsToDb([ROW])).toEqual([
      { id: ID, event: '100m Freestyle', medal: 'MP', medalNotes: 'New' },
    ]);
  });

  it('saves empty boxes as null', () => {
    const empty = {
      ...ROW,
      event: ' ',
      medalPotential: '' as const,
      notes: '',
    };
    expect(medalRowsToDb([empty])).toEqual([
      { id: ID, event: null, medal: null, medalNotes: null },
    ]);
  });
});

describe('hasMedalRowsShape', () => {
  it('accepts normal rows and an empty table', () => {
    expect(hasMedalRowsShape([ROW])).toBe(true);
    expect(hasMedalRowsShape([])).toBe(true);
  });

  it('rejects data that is not a list of rows', () => {
    expect(hasMedalRowsShape(null)).toBe(false);
    expect(hasMedalRowsShape(ROW)).toBe(false);
    expect(hasMedalRowsShape([null])).toBe(false);
  });

  it('rejects a fake id, a wrong medal or a missing field', () => {
    expect(hasMedalRowsShape([{ ...ROW, id: 'athlete-1' }])).toBe(false);
    expect(hasMedalRowsShape([{ ...ROW, medalPotential: 'Gold' }])).toBe(false);
    expect(hasMedalRowsShape([{ ...ROW, notes: undefined }])).toBe(false);
  });

  it('rejects text that is too long', () => {
    const long = 'a'.repeat(MAX_NOTES_LENGTH + 1);
    expect(hasMedalRowsShape([{ ...ROW, notes: long }])).toBe(false);
    expect(hasMedalRowsShape([{ ...ROW, event: long }])).toBe(false);
  });
});
