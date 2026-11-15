// AI declaration: 50% or more AI-generated
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { computeStats } from '../../../src/lib/dashboard';
import { mockChartLayout } from './chartTestUtils';
import DashboardClient from '../../../src/app/(application)/[gameId]/(coc)/dashboard/DashboardClient';
import type { Team } from '../../../src/lib/dashboard';
import type { Status } from '../../../src/components/commons/status';

beforeAll(() => {
  mockChartLayout();
});

const statuses: Status[] = [
  'Not Started',
  'In Progress',
  'Complete',
  'Submitted',
  'Action Required',
];

const stepTitles = [
  'Contact Info',
  'Team Size',
  'Accreditation',
  'Estimated Costs',
  'Review and Completion',
];

const testTeams: Team[] = [
  {
    name: 'Badminton Canada',
    logo: '/logos/badminton-canada.png',
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'Action Required',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'Not Started',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
  {
    name: 'Basketball Canada',
    // No logo data
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'Not Started',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'Not Started',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
  {
    name: 'Archery Canada',
    // No logo data
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'Not Started',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
  {
    name: 'Swimming Canada',
    // No logo data
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
  {
    name: 'Cycling Canada',
    // No logo data
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
  {
    name: 'Rowing Canada',
    // No logo data
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'Action Required',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'Action Required',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'Not Started',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
  {
    name: 'Soccer Canada',
    // No logo data
    columns: [
      {
        stepKey: 'contactInfo',
        title: 'Contact Info',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'teamSize',
        title: 'Team Size',
        href: '#',
        status: 'Complete',
      },
      {
        stepKey: 'accreditation',
        title: 'Accreditation',
        href: '#',
        status: 'In Progress',
      },
      {
        stepKey: 'estimatedCosts',
        title: 'Estimated Costs',
        href: '#',
        status: 'Not Started',
      },
      {
        stepKey: 'reviewAndCompletion',
        title: 'Review and Completion',
        href: '#',
        status: 'Not Started',
      },
    ],
  },
];

const allTestTeamNames = [
  'Badminton Canada',
  'Basketball Canada',
  'Archery Canada',
  'Swimming Canada',
  'Cycling Canada',
  'Rowing Canada',
  'Soccer Canada',
];

const renderDashboard = () =>
  render(
    <DashboardClient teams={testTeams} dashboardCharts={testDashboardCharts} />,
  );

const testDashboardCharts = stepTitles.map((title) => {
  const counts = Object.fromEntries(
    statuses.map((status) => [
      status,
      testTeams.filter((team) =>
        team.columns.some(
          (column) => column.title === title && column.status === status,
        ),
      ).length,
    ]),
  ) as Record<Status, number>;

  return {
    stepKey: testTeams[0].columns.find((column) => column.title === title)!
      .stepKey,
    title,
    counts,
  };
});

// Teams with a logo render the name as alt text on the logo image; teams
// without one fall back to rendering the name as plain text.
const findTeam = (name: string) =>
  screen.queryByText(name) ?? screen.queryByAltText(name);

describe('Dashboard page', () => {
  it('renders every team by default', () => {
    renderDashboard();

    allTestTeamNames.forEach((name) => {
      expect(findTeam(name)).toBeInTheDocument();
    });
  });

  it('shows the computed stat cards', () => {
    renderDashboard();
    const stats = computeStats(testDashboardCharts);

    expect(screen.getByText(stats.total)).toBeInTheDocument();
    expect(screen.getByText(`${stats.avgCompletion}%`)).toBeInTheDocument();
    expect(screen.getByText(`${stats.toReview}%`)).toBeInTheDocument();
    expect(screen.getByText(`${stats.toStart}%`)).toBeInTheDocument();
  });

  it('filters teams by search text', async () => {
    renderDashboard();

    await userEvent.type(
      screen.getByPlaceholderText('Search by team name'),
      'bad',
    );

    expect(findTeam('Badminton Canada')).toBeInTheDocument();
    expect(findTeam('Basketball Canada')).not.toBeInTheDocument();
  });

  it('shows a message when no teams match', async () => {
    renderDashboard();

    await userEvent.type(
      screen.getByPlaceholderText('Search by team name'),
      'zzz-no-match',
    );

    expect(
      screen.getByText('No NSOs match your search or filters.'),
    ).toBeInTheDocument();
  });

  it('filters teams by the global status filter', async () => {
    renderDashboard();

    await userEvent.click(
      screen.getByRole('button', { name: 'Filter by status' }),
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Action Required' }),
    );

    // Badminton (Contact Info) and Rowing (Team Size/Accreditation) both have
    // a step marked "Action Required"; teams with no such step drop out.
    expect(findTeam('Badminton Canada')).toBeInTheDocument();
    expect(findTeam('Rowing Canada')).toBeInTheDocument();
    expect(findTeam('Archery Canada')).not.toBeInTheDocument();
  });

  it('filters teams by a single column status', async () => {
    renderDashboard();

    await userEvent.click(
      screen.getByRole('button', { name: 'Filter Team Size by status' }),
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Complete' }));

    // Only Team Size === Complete: Swimming, Cycling, and Soccer.
    expect(findTeam('Swimming Canada')).toBeInTheDocument();
    expect(findTeam('Cycling Canada')).toBeInTheDocument();
    expect(findTeam('Soccer Canada')).toBeInTheDocument();
    expect(findTeam('Badminton Canada')).not.toBeInTheDocument();
  });

  it('opens the status overview panel for the clicked step', async () => {
    renderDashboard();

    await userEvent.click(
      screen.getByRole('button', { name: testDashboardCharts[0].title }),
    );

    expect(screen.getByLabelText('Status Overview Panel')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('Status Overview Panel')).getByText(
        testDashboardCharts[0].title,
      ),
    ).toBeInTheDocument();
  });

  it('shows the correct step names when charts are reordered independently', async () => {
    render(
      <DashboardClient
        teams={testTeams}
        dashboardCharts={[...testDashboardCharts].reverse()}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Team Size' }));

    const panel = within(screen.getByLabelText('Status Overview Panel'));
    expect(panel.getByText('3 of 7 complete')).toBeInTheDocument();
    expect(panel.getByText('Swimming Canada')).toBeInTheDocument();
    expect(panel.getByText('Cycling Canada')).toBeInTheDocument();
    expect(panel.getByText('Soccer Canada')).toBeInTheDocument();
    expect(panel.queryByText('Basketball Canada')).not.toBeInTheDocument();
    expect(panel.queryByText('Archery Canada')).not.toBeInTheDocument();
  });

  it('selects distinct steps with duplicate chart titles and resets the panel when switching', async () => {
    const duplicateCharts = testDashboardCharts.map((chart, index) => ({
      ...chart,
      title: index < 2 ? 'Shared title' : chart.title,
    }));
    render(
      <DashboardClient teams={testTeams} dashboardCharts={duplicateCharts} />,
    );
    const [contactCard, teamSizeCard] = screen.getAllByRole('button', {
      name: 'Shared title',
    });
    await userEvent.click(teamSizeCard);

    const panel = () => within(screen.getByLabelText('Status Overview Panel'));
    expect(teamSizeCard).toHaveAttribute('aria-pressed', 'true');
    expect(contactCard).toHaveAttribute('aria-pressed', 'false');
    expect(panel().getByText('3 of 7 complete')).toBeInTheDocument();
    expect(panel().queryByText('Basketball Canada')).not.toBeInTheDocument();
    await userEvent.click(
      panel().getByRole('button', { name: 'Action Required', pressed: false }),
    );
    expect(panel().getByText('Rowing Canada')).toBeInTheDocument();

    await userEvent.click(contactCard);
    expect(contactCard).toHaveAttribute('aria-pressed', 'true');
    expect(teamSizeCard).toHaveAttribute('aria-pressed', 'false');
    expect(
      panel().getByRole('button', { name: 'Complete', pressed: true }),
    ).toBeInTheDocument();
    expect(panel().getByText('5 of 7 complete')).toBeInTheDocument();
    expect(panel().getByText('Basketball Canada')).toBeInTheDocument();
  });

  it('preserves the selected step and panel status when its title changes on refresh', async () => {
    const { rerender } = renderDashboard();
    await userEvent.click(screen.getByRole('button', { name: 'Contact Info' }));
    const panel = () => within(screen.getByLabelText('Status Overview Panel'));
    await userEvent.click(
      panel().getByRole('button', { name: 'Action Required', pressed: false }),
    );

    const renamedCharts = testDashboardCharts.map((chart) =>
      chart.stepKey === 'contactInfo'
        ? { ...chart, title: 'Contact details' }
        : chart,
    );
    rerender(
      <DashboardClient teams={testTeams} dashboardCharts={renamedCharts} />,
    );

    expect(
      screen.getByRole('button', { name: 'Contact details', pressed: true }),
    ).toBeInTheDocument();
    expect(panel().getByText('Contact details')).toBeInTheDocument();
    expect(
      panel().getByRole('button', { name: 'Action Required', pressed: true }),
    ).toBeInTheDocument();
    expect(panel().getByText('Badminton Canada')).toBeInTheDocument();
  });

  it('hides the panel when the selected step is removed on refresh', async () => {
    const { rerender } = renderDashboard();
    await userEvent.click(screen.getByRole('button', { name: 'Contact Info' }));
    rerender(
      <DashboardClient
        teams={testTeams}
        dashboardCharts={testDashboardCharts.filter(
          (chart) => chart.stepKey !== 'contactInfo',
        )}
      />,
    );
    expect(
      screen.queryByLabelText('Status Overview Panel'),
    ).not.toBeInTheDocument();
  });

  it('closes the status overview panel', async () => {
    renderDashboard();

    await userEvent.click(
      screen.getByRole('button', { name: testDashboardCharts[0].title }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close panel' }));

    expect(
      screen.queryByLabelText('Status Overview Panel'),
    ).not.toBeInTheDocument();
  });

  it('refreshes the open panel counts and names when saved progress changes', async () => {
    const { rerender } = renderDashboard();
    await userEvent.click(screen.getByRole('button', { name: 'Contact Info' }));
    const panel = () => within(screen.getByLabelText('Status Overview Panel'));
    expect(panel().getByText('5 of 7 complete')).toBeInTheDocument();

    const updatedTeams = testTeams.map((team) => ({
      ...team,
      columns: team.columns.map((column) =>
        column.title === 'Contact Info'
          ? { ...column, status: 'Not Started' as const }
          : column,
      ),
    }));
    const updatedCharts = testDashboardCharts.map((chart) =>
      chart.title === 'Contact Info'
        ? {
            ...chart,
            counts: {
              'Not Started': 7,
              'In Progress': 0,
              Complete: 0,
              Submitted: 0,
              'Action Required': 0,
            },
          }
        : chart,
    );
    rerender(
      <DashboardClient teams={updatedTeams} dashboardCharts={updatedCharts} />,
    );

    expect(panel().getByText('0 of 7 complete')).toBeInTheDocument();
    expect(panel().getByText('No NSOs with this status.')).toBeInTheDocument();
    expect(panel().queryByText('Basketball Canada')).not.toBeInTheDocument();
    await userEvent.click(
      panel().getByRole('button', { name: 'Not Started', pressed: false }),
    );
    expect(panel().getByText('7 of 7 not started')).toBeInTheDocument();
    expect(panel().getByText('Basketball Canada')).toBeInTheDocument();
  });

  it('clears the open panel counts when refreshed game data contains no NSOs', async () => {
    const { rerender } = renderDashboard();
    await userEvent.click(screen.getByRole('button', { name: 'Contact Info' }));
    const emptyCharts = testDashboardCharts.map((chart) => ({
      ...chart,
      counts: {
        'Not Started': 0,
        'In Progress': 0,
        Complete: 0,
        Submitted: 0,
        'Action Required': 0,
      },
    }));
    rerender(<DashboardClient teams={[]} dashboardCharts={emptyCharts} />);

    const panel = within(screen.getByLabelText('Status Overview Panel'));
    expect(panel.getByText('0 of 0 complete')).toBeInTheDocument();
    expect(panel.getByText('No NSOs with this status.')).toBeInTheDocument();
  });

  it('displays the team name when no logo is provided', () => {
    renderDashboard();

    expect(screen.getByText('Basketball Canada')).toBeInTheDocument();
  });

  it('renders the team logo when one is provided', () => {
    renderDashboard();

    expect(screen.getByAltText('Badminton Canada')).toBeInTheDocument(); // Only Badminton Canada has a logo in the test data
  });
});
