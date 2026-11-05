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
  'Completed',
  'Submitted',
  'Requires Update',
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
      { title: 'Contact Info', href: '#', status: 'Requires Update' },
      { title: 'Team Size', href: '#', status: 'In Progress' },
      { title: 'Accreditation', href: '#', status: 'Completed' },
      { title: 'Estimated Costs', href: '#', status: 'Not Started' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
    ],
  },
  {
    name: 'Basketball Canada',
    // No logo data
    columns: [
      { title: 'Contact Info', href: '#', status: 'Completed' },
      { title: 'Team Size', href: '#', status: 'In Progress' },
      { title: 'Accreditation', href: '#', status: 'Not Started' },
      { title: 'Estimated Costs', href: '#', status: 'Not Started' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
    ],
  },
  {
    name: 'Archery Canada',
    // No logo data
    columns: [
      { title: 'Contact Info', href: '#', status: 'Completed' },
      { title: 'Team Size', href: '#', status: 'Not Started' },
      { title: 'Accreditation', href: '#', status: 'Completed' },
      { title: 'Estimated Costs', href: '#', status: 'In Progress' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
    ],
  },
  {
    name: 'Swimming Canada',
    // No logo data
    columns: [
      { title: 'Contact Info', href: '#', status: 'Completed' },
      { title: 'Team Size', href: '#', status: 'Completed' },
      { title: 'Accreditation', href: '#', status: 'Completed' },
      { title: 'Estimated Costs', href: '#', status: 'In Progress' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
    ],
  },
  {
    name: 'Cycling Canada',
    // No logo data
    columns: [
      { title: 'Contact Info', href: '#', status: 'Completed' },
      { title: 'Team Size', href: '#', status: 'Completed' },
      { title: 'Accreditation', href: '#', status: 'Completed' },
      { title: 'Estimated Costs', href: '#', status: 'In Progress' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
    ],
  },
  {
    name: 'Rowing Canada',
    // No logo data
    columns: [
      { title: 'Contact Info', href: '#', status: 'In Progress' },
      { title: 'Team Size', href: '#', status: 'Requires Update' },
      { title: 'Accreditation', href: '#', status: 'Requires Update' },
      { title: 'Estimated Costs', href: '#', status: 'Not Started' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
    ],
  },
  {
    name: 'Soccer Canada',
    // No logo data
    columns: [
      { title: 'Contact Info', href: '#', status: 'Completed' },
      { title: 'Team Size', href: '#', status: 'Completed' },
      { title: 'Accreditation', href: '#', status: 'In Progress' },
      { title: 'Estimated Costs', href: '#', status: 'Not Started' },
      { title: 'Review and Completion', href: '#', status: 'Not Started' },
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

  return { title, counts };
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
      screen.getByRole('checkbox', { name: 'Requires Update' }),
    );

    // Badminton (Contact Info) and Rowing (Team Size/Accreditation) both have
    // a step marked "Requires Update"; teams with no such step drop out.
    expect(findTeam('Badminton Canada')).toBeInTheDocument();
    expect(findTeam('Rowing Canada')).toBeInTheDocument();
    expect(findTeam('Archery Canada')).not.toBeInTheDocument();
  });

  it('filters teams by a single column status', async () => {
    renderDashboard();

    await userEvent.click(
      screen.getByRole('button', { name: 'Filter Team Size by status' }),
    );
    await userEvent.click(screen.getByRole('checkbox', { name: 'Completed' }));

    // Only Team Size === Completed: Swimming, Cycling, and Soccer.
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

  it('displays the team name when no logo is provided', () => {
    renderDashboard();

    expect(screen.getByText('Basketball Canada')).toBeInTheDocument();
  });

  it('renders the team logo when one is provided', () => {
    renderDashboard();

    expect(screen.getByAltText('Badminton Canada')).toBeInTheDocument(); // Only Badminton Canada has a logo in the test data
  });
});
