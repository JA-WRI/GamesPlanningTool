// AI contribution: Above 50% AI-generated
import { describe, it, expect } from 'vitest';
import { transformDashboardData } from '@/lib/dashboard-data';
import { computeStats } from '@/lib/dashboard';
import { TaskStatus } from '@/generated/prisma/enums';

const progress = (status: TaskStatus) => ({
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
        contactInfo: TaskStatus.COMPLETE,
        teamSize: TaskStatus.IN_PROGRESS,
        accreditation: TaskStatus.SUBMITTED,
        estimatedCosts: TaskStatus.ACTION_REQUIRED,
        reviewAndCompletion: TaskStatus.NOT_STARTED,
      }),
    ]);

    expect(
      teams[0].columns.map(({ stepKey, title, status }) => ({
        stepKey,
        title,
        status,
      })),
    ).toEqual([
      { stepKey: 'contactInfo', title: 'Contact Info', status: 'Complete' },
      { stepKey: 'teamSize', title: 'Team Size', status: 'In Progress' },
      { stepKey: 'accreditation', title: 'Accreditation', status: 'Submitted' },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        status: 'Action Required',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        status: 'Not Started',
      },
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
      record('A', progress(TaskStatus.COMPLETE)),
      record('B', progress(TaskStatus.SUBMITTED)),
      record('C', progress(TaskStatus.IN_PROGRESS)),
      record('D', progress(TaskStatus.ACTION_REQUIRED)),
      record('E', progress(TaskStatus.NOT_STARTED)),
      record('F', null),
    ]);
    expect(teams).toHaveLength(6);
    expect(dashboardData).toHaveLength(5);
    for (const chart of dashboardData) {
      expect(chart.counts).toEqual({
        'Not Started': 2,
        'In Progress': 1,
        Complete: 1,
        Submitted: 1,
        'Action Required': 1,
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
        contactInfo: TaskStatus.COMPLETE,
        teamSize: TaskStatus.IN_PROGRESS,
        accreditation: TaskStatus.SUBMITTED,
        estimatedCosts: TaskStatus.ACTION_REQUIRED,
        reviewAndCompletion: TaskStatus.NOT_STARTED,
      }),
      record('B', null),
    ]);

    expect(dashboardData).toEqual([
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        counts: {
          'Not Started': 1,
          'In Progress': 0,
          Complete: 1,
          Submitted: 0,
          'Action Required': 0,
        },
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        counts: {
          'Not Started': 1,
          'In Progress': 1,
          Complete: 0,
          Submitted: 0,
          'Action Required': 0,
        },
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        counts: {
          'Not Started': 1,
          'In Progress': 0,
          Complete: 0,
          Submitted: 1,
          'Action Required': 0,
        },
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        counts: {
          'Not Started': 1,
          'In Progress': 0,
          Complete: 0,
          Submitted: 0,
          'Action Required': 1,
        },
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        counts: {
          'Not Started': 2,
          'In Progress': 0,
          Complete: 0,
          Submitted: 0,
          'Action Required': 0,
        },
      },
    ]);
  });

  it('calculates summary percentages from all saved steps and missing records', () => {
    const { dashboardData } = transformDashboardData([
      record('A', {
        contactInfo: TaskStatus.COMPLETE,
        teamSize: TaskStatus.COMPLETE,
        accreditation: TaskStatus.SUBMITTED,
        estimatedCosts: TaskStatus.IN_PROGRESS,
        reviewAndCompletion: TaskStatus.NOT_STARTED,
      }),
      record('B', null),
    ]);

    // Two NSOs, ten steps: two complete, one submitted, six not started.
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
