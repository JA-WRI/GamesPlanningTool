// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  MOCK_DISCIPLINES,
  MOCK_TEAM_SIZE,
} from '@/features/team-size/lib/mockData';
import {
  DISCIPLINE_TOTAL_COLUMN,
  DisciplineGridRow,
  disciplineTotal,
  disciplinesToGridRows,
  gridRowsToDisciplines,
} from '@/features/team-size/lib/disciplineGridLogic';
import { GridNumber } from '@/features/team-size/lib/teamSizeGridLogic';

// one "Best F" row with HP, SS/BA, AE, MO counts
function row(
  hp: GridNumber,
  ssba: GridNumber,
  ae: GridNumber,
  mo: GridNumber,
): DisciplineGridRow {
  return { id: 'bestF', label: 'Best F', hp, ssba, ae, mo };
}

// the total of one estimate row in the mock data
const mockTotal = (id: DisciplineGridRow['id']) => {
  const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
  const found = rows.find((r) => r.id === id);
  return found ? disciplineTotal(found) : undefined;
};

describe('disciplineTotal', () => {
  it('adds HP + SS/BA + AE + MO', () => {
    expect(disciplineTotal(row(4, 4, 2, 3))).toBe(13);
  });

  it('counts empty boxes as 0', () => {
    expect(disciplineTotal(row('', 3, '', 1))).toBe(4);
    expect(disciplineTotal(row('', '', '', ''))).toBe(0);
  });
});

describe('DISCIPLINE_TOTAL_COLUMN', () => {
  it('is a calculated column, so the grid shows it bold and read-only', () => {
    expect(DISCIPLINE_TOTAL_COLUMN.field).toBe('total');
    expect(DISCIPLINE_TOTAL_COLUMN.type).toBe('calculated');
  });

  it('works out the total with disciplineTotal', () => {
    expect(DISCIPLINE_TOTAL_COLUMN.formula?.evaluate).toBe(disciplineTotal);
  });
});

describe('disciplinesToGridRows', () => {
  it('makes a Best F, Best M, Low F and Low M row', () => {
    const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(rows.map((r) => r.id)).toEqual(['bestF', 'bestM', 'lowF', 'lowM']);
    expect(rows.map((r) => r.label)).toEqual([
      'Best F',
      'Best M',
      'Low F',
      'Low M',
    ]);
  });

  it('puts each discipline in its own column', () => {
    const [bestF] = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(bestF).toMatchObject({ hp: 4, ssba: 4, ae: 2, mo: 3 });
  });

  it('gives totals that match the mock data', () => {
    expect(mockTotal('bestF')).toBe(13);
  });

  it('leaves a discipline empty when it is missing', () => {
    const [bestF] = disciplinesToGridRows([MOCK_DISCIPLINES.rows[0]]);
    expect(bestF).toMatchObject({ hp: 4, ssba: '', ae: '', mo: '' });
  });
});

describe('gridRowsToDisciplines', () => {
  it('round-trips without losing values', () => {
    const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(gridRowsToDisciplines(rows)).toEqual(MOCK_DISCIPLINES.rows);
  });

  it('saves a changed number in the right discipline', () => {
    const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    rows[2] = { ...rows[2], ae: 0 };
    const ae = gridRowsToDisciplines(rows).find((d) => d.id === 'ae');
    expect(ae?.lowF).toBe(0);
  });

  it('leaves values empty when an estimate row is missing', () => {
    const [hp] = gridRowsToDisciplines([row(5, 1, 1, 1)]);
    expect(hp).toEqual({
      id: 'hp',
      label: 'HP',
      bestF: 5,
      bestM: '',
      lowF: '',
      lowM: '',
    });
  });
});

describe('mock discipline data', () => {
  const { male, female } = MOCK_TEAM_SIZE.athletes;

  it('adds up to the team size best guess', () => {
    expect(mockTotal('bestF')).toBe(Number(female.bestGuess));
    expect(mockTotal('bestM')).toBe(Number(male.bestGuess));
  });

  it('adds up to the team size low estimate', () => {
    expect(mockTotal('lowF')).toBe(Number(female.low));
    expect(mockTotal('lowM')).toBe(Number(male.low));
  });

  it('never has Low above Best for a discipline', () => {
    MOCK_DISCIPLINES.rows.forEach((r) => {
      expect(r.lowF).toBeLessThanOrEqual(r.bestF as number);
      expect(r.lowM).toBeLessThanOrEqual(r.bestM as number);
    });
  });
});
