//50% or more AI-generated
import { describe, it, expect } from 'vitest';
import {
  computeStats,
  cycleIndex,
  filterByColumnStatuses,
  filterTeams,
  namesByStatusAtColumn,
  percentage,
  totalOf,
} from '../../../src/lib/dashboard';
import type { Status } from '../../../src/components/commons/status';

const counts = (
  notStarted: number,
  inProgress: number,
  completed: number,
  submitted: number,
  requiresUpdate: number,
) => ({
  'Not Started': notStarted,
  'In Progress': inProgress,
  Completed: completed,
  Submitted: submitted,
  'Requires Update': requiresUpdate,
});

const team = (name: string, ...statuses: Status[]) => ({
  name,
  columns: statuses.map((status, i) => ({
    title: `Step ${i + 1}`,
    status,
  })),
});

const teams = [
  team('Alpha', 'Completed', 'Not Started'),
  team('Beta', 'Submitted', 'Completed'),
  team('Gamma', 'Not Started', 'Not Started'),
  team('Delta', 'Not Started', 'Requires Update'),
];

describe('dashboard logic', () => {
  it('percentage rounds and handles an empty whole', () => {
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(0, 0)).toBe(0);
  });

  it('totalOf adds every status', () => {
    expect(totalOf(counts(1, 2, 3, 4, 5))).toBe(15);
  });

  it('computeStats uses the first step for the NSO total', () => {
    // 20 slots: 4 completed, 2 submitted, 8 not started
    const stats = computeStats([
      { counts: counts(4, 1, 2, 1, 2) },
      { counts: counts(4, 2, 2, 1, 1) },
    ]);

    expect(stats).toEqual({
      total: 10,
      avgCompletion: 20,
      toReview: 10,
      toStart: 40,
    });
  });

  it('computeStats on no steps is all zeros', () => {
    expect(computeStats([])).toEqual({
      total: 0,
      avgCompletion: 0,
      toReview: 0,
      toStart: 0,
    });
  });

  describe('filterTeams', () => {
    it('matches names case-insensitively', () => {
      expect(filterTeams(teams, '  ALP ', []).map((t) => t.name)).toEqual([
        'Alpha',
      ]);
    });

    it('returns everything without search or statuses', () => {
      expect(filterTeams(teams, '', [])).toHaveLength(4);
    });

    it('keeps teams with any step in a selected status', () => {
      expect(
        filterTeams(teams, '', ['Requires Update']).map((t) => t.name),
      ).toEqual(['Delta']);
    });

    it('combines search and status filters', () => {
      expect(filterTeams(teams, 'beta', ['Completed'])).toHaveLength(1);
      expect(filterTeams(teams, 'alpha', ['Submitted'])).toHaveLength(0);
    });
  });

  it('cycleIndex wraps in both directions', () => {
    expect(cycleIndex(0, -1, 5)).toBe(4);
    expect(cycleIndex(4, 1, 5)).toBe(0);
    expect(cycleIndex(2, 1, 5)).toBe(3);
  });

  describe('namesByStatusAtColumn', () => {
    it('groups team names by their status at the given column index', () => {
      expect(namesByStatusAtColumn(teams, 0)).toEqual({
        'Not Started': ['Gamma', 'Delta'],
        'In Progress': [],
        Completed: ['Alpha'],
        Submitted: ['Beta'],
        'Requires Update': [],
      });
    });

    it('returns an empty list for every status when the index is out of range', () => {
      expect(namesByStatusAtColumn(teams, 99)).toEqual({
        'Not Started': [],
        'In Progress': [],
        Completed: [],
        Submitted: [],
        'Requires Update': [],
      });
    });
  });

  describe('filterByColumnStatuses', () => {
    const titledTeam = (
      name: string,
      columns: { title: string; status: Status }[],
    ) => ({ name, columns });

    const titledTeams = [
      titledTeam('Alpha', [
        { title: 'Team Size', status: 'Completed' },
        { title: 'Accreditation', status: 'Not Started' },
      ]),
      titledTeam('Beta', [
        { title: 'Team Size', status: 'Submitted' },
        { title: 'Accreditation', status: 'Completed' },
      ]),
    ];

    it('keeps every team when there are no active filters', () => {
      expect(filterByColumnStatuses(titledTeams, {})).toHaveLength(2);
    });

    it('keeps only teams matching an active column filter', () => {
      expect(
        filterByColumnStatuses(titledTeams, {
          'Team Size': ['Completed'],
        }).map((t) => t.name),
      ).toEqual(['Alpha']);
    });

    it('combines filters across multiple columns', () => {
      expect(
        filterByColumnStatuses(titledTeams, {
          'Team Size': ['Submitted'],
          Accreditation: ['Completed'],
        }).map((t) => t.name),
      ).toEqual(['Beta']);
    });

    it('excludes teams missing the filtered column entirely', () => {
      expect(
        filterByColumnStatuses(titledTeams, {
          'Missing Column': ['Completed'],
        }),
      ).toHaveLength(0);
    });
  });
});
