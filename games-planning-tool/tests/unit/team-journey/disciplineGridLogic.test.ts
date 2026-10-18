// AI contribution: 50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  MOCK_DISCIPLINES,
  MOCK_TEAM_SIZE,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/mockData';
import {
  DISCIPLINE_TOTAL_COLUMN,
  DisciplineGridRow,
  disciplinesToGridRows,
  gridRowsToDisciplines,
  withDisciplineLevelLabels,
  withDisciplineTotals,
} from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/disciplineGridLogic';
import { GridNumber } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/teamSizeGridLogic';

// one "Best F" row with HP,SS/BA, AE, MO counts and a total to be replaced
function row(
  hp: GridNumber,
  ssba: GridNumber,
  ae: GridNumber,
  mo: GridNumber,
): DisciplineGridRow {
  return { id: 'bestF', label: 'Best F', hp, ssba, ae, mo, total: -1 };
}

// the total of one estimate row in the mock data
const mockTotal = (id: DisciplineGridRow['id']) =>
  disciplinesToGridRows(MOCK_DISCIPLINES.rows).find((r) => r.id === id)?.total;

describe('DISCIPLINE_TOTAL_COLUMN', () => {
  const formula = DISCIPLINE_TOTAL_COLUMN.formula!;

  it('is a formula column, so the grid shows it bold and read-only', () => {
    expect(DISCIPLINE_TOTAL_COLUMN.field).toBe('total');
    expect(DISCIPLINE_TOTAL_COLUMN.type).toBe('calculated');
    expect(formula.fieldA).toBe('total');
  });

  it('points its second field at nothing, so the grid adds 0', () => {
    const [bestF] = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(bestF[formula.fieldB]).toBeUndefined();
  });

  it('shows the real sum for every row, the way the grid works it out', () => {
    // same steps as the shared grid: Number(value) || 0 for each field, then +
    const shown = (r: DisciplineGridRow) =>
      (Number(r[formula.fieldA]) || 0) + (Number(r[formula.fieldB]) || 0);
    const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(rows.map(shown)).toEqual([13, 12, 10, 12]);
  });
});

describe('withDisciplineTotals', () => {
  it('adds HP + SS/BA + AE + MO', () => {
    expect(withDisciplineTotals([row(4, 4, 2, 3)])[0].total).toBe(13);
  });

  it('counts empty boxes as 0', () => {
    expect(withDisciplineTotals([row('', 3, '', 1)])[0].total).toBe(4);
    expect(withDisciplineTotals([row('', '', '', '')])[0].total).toBe(0);
  });

  it('replaces whatever was typed in Total', () => {
    const typedOver = { ...row(1, 1, 1, 1), total: 99 };
    expect(withDisciplineTotals([typedOver])[0].total).toBe(4);
  });

  it('keeps the other values as they are', () => {
    const [fixed] = withDisciplineTotals([row(1, 2, 3, 4)]);
    expect(fixed).toEqual({ ...row(1, 2, 3, 4), total: 10 });
  });
});

describe('withDisciplineLevelLabels', () => {
  it('puts the row names back after a user types over them', () => {
    const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows).map((r) => ({
      ...r,
      label: 'x',
    }));
    expect(withDisciplineLevelLabels(rows).map((r) => r.label)).toEqual([
      'Best F',
      'Best M',
      'Low F',
      'Low M',
    ]);
  });
});

describe('disciplinesToGridRows', () => {
  it('makes a Best F, Best M, Low F and Low M row', () => {
    const rows = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(rows.map((r) => r.id)).toEqual(['bestF', 'bestM', 'lowF', 'lowM']);
  });

  it('puts each discipline in its own column', () => {
    const [bestF] = disciplinesToGridRows(MOCK_DISCIPLINES.rows);
    expect(bestF).toMatchObject({ hp: 4, ssba: 4, ae: 2, mo: 3 });
  });

  it('fills in the totals', () => {
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
