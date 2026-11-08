// AI contribution: Above 50% AI-generated
import { describe, it, expect } from 'vitest';
import { transformDashboardData } from '@/lib/dashboard-data';
import { computeStats } from '@/lib/dashboard';
import type { ProgressStatus } from '@/generated/prisma/enums';

const progress = (status: ProgressStatus) => ({
  contactInfo: status,
  teamSize: status,
  accreditation: status,
  estimatedCosts: status,
  reviewAndCompletion: status,
});
const record = (
  name: string,
  statuses: ReturnType<typeof progress> | null,
) => ({
  id: name,
  nso: { name },
  progressTracking: statuses,
});

describe('transformDashboardData', () => {
  it('maps all five saved statuses to the matching journey steps', () => {
    const { teams } = transformDashboardData([
      record('Badminton Canada', {
        contactInfo: 'completed',
        teamSize: 'in_progress',
        accreditation: 'submitted',
        estimatedCosts: 'requires_update',
        reviewAndCompletion: 'not_started',
      }),
    ]);

    expect(
      teams[0].columns.map(({ title, status }) => ({ title, status })),
    ).toEqual([
      { title: 'Contact Info', status: 'Completed' },
      { title: 'Team Size', status: 'In Progress' },
      { title: 'Accreditation', status: 'Submitted' },
      { title: 'Estimated Costs', status: 'Requires Update' },
      { title: 'Review and Completion', status: 'Not Started' },
    ]);
  });

  it('shows Not Started for every step when a progress record is missing', () => {
    const { teams, dashboardData } = transformDashboardData([
      record('Cross Country Skiing', null),
    ]);
    expect(teams[0].columns).toHaveLength(5);
    expect(
      teams[0].columns.every((column) => column.status === 'Not Started'),
    ).toBe(true);
    expect(
      dashboardData.every((chart) => chart.counts['Not Started'] === 1),
    ).toBe(true);
  });

  it('counts every NSO once per step, including NSOs without progress', () => {
    const { teams, dashboardData } = transformDashboardData([
      record('A', progress('completed')),
      record('B', progress('submitted')),
      record('C', progress('in_progress')),
      record('D', progress('requires_update')),
      record('E', progress('not_started')),
      record('F', null),
    ]);
    expect(teams).toHaveLength(6);
    expect(dashboardData).toHaveLength(5);
    for (const chart of dashboardData) {
      expect(chart.counts).toEqual({
        'Not Started': 2,
        'In Progress': 1,
        Completed: 1,
        Submitted: 1,
        'Requires Update': 1,
      });
    }
  });

  it('returns no teams and zero counts for a game without NSOs', () => {
    const { teams, dashboardData } = transformDashboardData([]);
    expect(teams).toEqual([]);
    expect(dashboardData).toHaveLength(5);
    for (const chart of dashboardData) {
      expect(Object.values(chart.counts)).toEqual([0, 0, 0, 0, 0]);
    }
  });

  it('keeps counts separate when each step has different progress', () => {
    const { dashboardData } = transformDashboardData([
      record('A', {
        contactInfo: 'completed',
        teamSize: 'in_progress',
        accreditation: 'submitted',
        estimatedCosts: 'requires_update',
        reviewAndCompletion: 'not_started',
      }),
      record('B', null),
    ]);

    expect(dashboardData).toEqual([
      {
        title: 'Contact Info',
        counts: {
          'Not Started': 1,
          'In Progress': 0,
          Completed: 1,
          Submitted: 0,
          'Requires Update': 0,
        },
      },
      {
        title: 'Team Size',
        counts: {
          'Not Started': 1,
          'In Progress': 1,
          Completed: 0,
          Submitted: 0,
          'Requires Update': 0,
        },
      },
      {
        title: 'Accreditation',
        counts: {
          'Not Started': 1,
          'In Progress': 0,
          Completed: 0,
          Submitted: 1,
          'Requires Update': 0,
        },
      },
      {
        title: 'Estimated Costs',
        counts: {
          'Not Started': 1,
          'In Progress': 0,
          Completed: 0,
          Submitted: 0,
          'Requires Update': 1,
        },
      },
      {
        title: 'Review and Completion',
        counts: {
          'Not Started': 2,
          'In Progress': 0,
          Completed: 0,
          Submitted: 0,
          'Requires Update': 0,
        },
      },
    ]);
  });

  it('calculates summary percentages from all saved steps and missing records', () => {
    const { dashboardData } = transformDashboardData([
      record('A', {
        contactInfo: 'completed',
        teamSize: 'completed',
        accreditation: 'submitted',
        estimatedCosts: 'in_progress',
        reviewAndCompletion: 'not_started',
      }),
      record('B', null),
    ]);

    // Two NSOs, ten steps: two completed, one submitted, six not started.
    expect(computeStats(dashboardData)).toEqual({
      total: 2,
      avgCompletion: 20,
      toReview: 10,
      toStart: 60,
    });
  });

  it('shows zero summary percentages for five empty charts', () => {
    const { dashboardData } = transformDashboardData([]);
    expect(computeStats(dashboardData)).toEqual({
      total: 0,
      avgCompletion: 0,
      toReview: 0,
      toStart: 0,
    });
  });

  it('derives logo paths from NSO names', () => {
    const { teams } = transformDashboardData([
      record('Badminton Canada', null),
    ]);
    expect(teams[0].name).toBe('Badminton Canada');
    expect(teams[0].logo).toBe('/logos/Badminton_Canada_logo.png');
  });
});
