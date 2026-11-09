// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import { INITIAL_TEAM_SIZE } from '@/features/team-size/lib/constants';
import { MOCK_DISCIPLINES, MOCK_TEAM_SIZE } from './fixtures';
import {
  dbToDisciplines,
  dbToGridNumber,
  dbToTeamSize,
  dbToText,
  disciplinesToDb,
  gridNumberToDb,
  teamSizeToDb,
  textToDb,
  toDbIds,
  isTeamSizeSavable,
  hasTeamSizeShape,
  MAX_NOTES_LENGTH,
} from '@/features/team-size/lib/teamSizeDbMapping';

describe('hasTeamSizeShape', () => {
  it('accepts the normal page data', () => {
    expect(hasTeamSizeShape(MOCK_TEAM_SIZE, MOCK_DISCIPLINES)).toBe(true);
  });

  it('rejects missing or broken data instead of crashing', () => {
    expect(hasTeamSizeShape(null, MOCK_DISCIPLINES)).toBe(false);
    expect(hasTeamSizeShape({}, MOCK_DISCIPLINES)).toBe(false);
    expect(hasTeamSizeShape(MOCK_TEAM_SIZE, { notes: '' })).toBe(false);
    const noFemale = {
      ...MOCK_TEAM_SIZE,
      athletes: { male: MOCK_TEAM_SIZE.athletes.male },
    };
    expect(hasTeamSizeShape(noFemale, MOCK_DISCIPLINES)).toBe(false);
  });

  it('rejects notes that are too long', () => {
    const notes = 'a'.repeat(MAX_NOTES_LENGTH + 1);
    expect(
      hasTeamSizeShape({ ...MOCK_TEAM_SIZE, notes }, MOCK_DISCIPLINES),
    ).toBe(false);
    expect(
      hasTeamSizeShape(MOCK_TEAM_SIZE, { ...MOCK_DISCIPLINES, notes }),
    ).toBe(false);
  });

  it('rejects unknown or repeated disciplines', () => {
    const [hp] = MOCK_DISCIPLINES.rows;
    const unknown = { rows: [{ ...hp, id: 'xyz' }], notes: '' };
    const repeated = { rows: [hp, hp], notes: '' };
    expect(hasTeamSizeShape(MOCK_TEAM_SIZE, unknown)).toBe(false);
    expect(hasTeamSizeShape(MOCK_TEAM_SIZE, repeated)).toBe(false);
  });

  it('rejects a discipline count that is not a number', () => {
    const [hp] = MOCK_DISCIPLINES.rows;
    const disciplines = { rows: [{ ...hp, bestF: '4' }], notes: '' };
    expect(hasTeamSizeShape(MOCK_TEAM_SIZE, disciplines)).toBe(false);
  });
});

describe('isTeamSizeSavable', () => {
  it('accepts the mock data and an empty page', () => {
    expect(isTeamSizeSavable(MOCK_TEAM_SIZE, MOCK_DISCIPLINES)).toBe(true);
    expect(isTeamSizeSavable(INITIAL_TEAM_SIZE, { rows: [], notes: '' })).toBe(
      true,
    );
  });

  it('rejects Low above Best Guess', () => {
    const teamSize = {
      ...MOCK_TEAM_SIZE,
      athletes: {
        ...MOCK_TEAM_SIZE.athletes,
        male: { low: '20', bestGuess: '12', high: '16' },
      },
    };
    expect(isTeamSizeSavable(teamSize, MOCK_DISCIPLINES)).toBe(false);
  });

  it('rejects decimals, negatives, text and numbers over 999', () => {
    for (const bad of ['1.5', '-1', 'abc', '1000']) {
      const teamSize = { ...MOCK_TEAM_SIZE, projectedMedalsHigh: bad };
      expect(isTeamSizeSavable(teamSize, MOCK_DISCIPLINES)).toBe(false);
    }
  });

  it('rejects medals Low above High', () => {
    const teamSize = {
      ...MOCK_TEAM_SIZE,
      projectedMedalsLow: '6',
      projectedMedalsHigh: '5',
    };
    expect(isTeamSizeSavable(teamSize, MOCK_DISCIPLINES)).toBe(false);
  });

  it('rejects a discipline with Low above Best', () => {
    const disciplines = {
      rows: [
        {
          id: 'hp' as const,
          label: 'HP',
          bestF: 1,
          bestM: 3,
          lowF: 2,
          lowM: 3,
        },
      ],
      notes: '',
    };
    expect(isTeamSizeSavable(MOCK_TEAM_SIZE, disciplines)).toBe(false);
  });
});

describe('toDbIds', () => {
  const nsoId = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

  it('accepts a real game id and NSO uuid', () => {
    expect(toDbIds('1', nsoId)).toEqual({ gameId: 1, nsoId });
  });

  it('rejects the fake ids from the mock data', () => {
    expect(toDbIds('game_id_1', nsoId)).toBeNull();
    expect(toDbIds('1', 'nso_1')).toBeNull();
  });
});

describe('textToDb and dbToText', () => {
  it('turns text into a number and back', () => {
    expect(textToDb('12')).toBe(12);
    expect(dbToText(12)).toBe('12');
  });

  it('keeps 0 as a number, not empty', () => {
    expect(textToDb('0')).toBe(0);
    expect(dbToText(0)).toBe('0');
  });

  it('saves an empty box as null and loads it back empty', () => {
    expect(textToDb('')).toBeNull();
    expect(textToDb('   ')).toBeNull();
    expect(dbToText(null)).toBe('');
  });
});

describe('gridNumberToDb and dbToGridNumber', () => {
  it('keeps numbers and turns empty into null and back', () => {
    expect(gridNumberToDb(4)).toBe(4);
    expect(gridNumberToDb(0)).toBe(0);
    expect(gridNumberToDb('')).toBeNull();
    expect(dbToGridNumber(4)).toBe(4);
    expect(dbToGridNumber(null)).toBe('');
  });
});

describe('teamSizeToDb', () => {
  it('maps every page box to its column', () => {
    const row = teamSizeToDb(MOCK_TEAM_SIZE, MOCK_DISCIPLINES);
    expect(row).toEqual({
      lowFemale: 10,
      bestGuessFemale: 13,
      highFemale: 13,
      lowMale: 12,
      bestGuessMale: 12,
      highMale: 16,
      notes: MOCK_TEAM_SIZE.notes,
      disciplineBreakdownNotes: MOCK_DISCIPLINES.notes,
      lowMedals: 2,
      highMedals: 5,
    });
  });

  it('saves an empty page as nulls and empty notes', () => {
    const row = teamSizeToDb(INITIAL_TEAM_SIZE, { rows: [], notes: '' });
    expect(Object.values(row).every((v) => v === null || v === '')).toBe(true);
  });
});

describe('dbToTeamSize', () => {
  it('shows an empty page when nothing is saved yet', () => {
    expect(dbToTeamSize(null)).toEqual(INITIAL_TEAM_SIZE);
  });

  it('gives back the same page data after saving', () => {
    const saved = teamSizeToDb(MOCK_TEAM_SIZE, MOCK_DISCIPLINES);
    expect(dbToTeamSize(saved)).toEqual(MOCK_TEAM_SIZE);
  });
});

describe('disciplinesToDb', () => {
  it('makes one row per discipline with the right columns', () => {
    const rows = disciplinesToDb(MOCK_DISCIPLINES);
    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({
      discipline: 'hp',
      bestFemale: 4,
      bestMale: 3,
      lowFemale: 3,
      lowMale: 3,
    });
  });

  it('saves empty boxes as null', () => {
    const rows = disciplinesToDb({
      rows: [
        { id: 'ae', label: 'AE', bestF: '', bestM: 2, lowF: '', lowM: '' },
      ],
      notes: '',
    });
    expect(rows[0]).toEqual({
      discipline: 'ae',
      bestFemale: null,
      bestMale: 2,
      lowFemale: null,
      lowMale: null,
    });
  });
});

describe('dbToDisciplines', () => {
  it('gives back the same disciplines after saving', () => {
    const saved = disciplinesToDb(MOCK_DISCIPLINES);
    expect(dbToDisciplines(saved, MOCK_DISCIPLINES.notes)).toEqual(
      MOCK_DISCIPLINES,
    );
  });

  it('always shows HP, SS/BA, AE, MO in order, even if saved out of order', () => {
    const saved = disciplinesToDb(MOCK_DISCIPLINES).reverse();
    const ids = dbToDisciplines(saved, '').rows.map((row) => row.id);
    expect(ids).toEqual(['hp', 'ssba', 'ae', 'mo']);
  });

  it('shows empty boxes for disciplines not saved yet', () => {
    const result = dbToDisciplines([], '');
    expect(result.rows).toHaveLength(4);
    expect(result.rows[1]).toEqual({
      id: 'ssba',
      label: 'SS/BA',
      bestF: '',
      bestM: '',
      lowF: '',
      lowM: '',
    });
  });
});
