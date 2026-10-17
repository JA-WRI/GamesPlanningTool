//50% or more AI-generated
import { describe, it, expect, beforeAll } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../../../src/app/(application)/[gameId]/(coc)/dashboard/page';
import { computeStats } from '../../../src/lib/dashboard';
import { mockDashboard } from '../../../src/lib/mock-data-chart';
import { mockChartLayout } from './chartTestUtils';

beforeAll(() => {
  mockChartLayout();
});

const allTeamNames = [
  'Badminton Canada',
  'Basketball Canada',
  'Archery Canada',
  'Swimming Canada',
  'Cycling Canada',
  'Rowing Canada',
  'Soccer Canada',
];

// Teams with a logo render the name as alt text on the logo image; teams
// without one fall back to rendering the name as plain text.
const findTeam = (name: string) =>
  screen.queryByText(name) ?? screen.queryByAltText(name);

describe('Dashboard page', () => {
  it('renders every team by default', () => {
    render(<Dashboard />);

    allTeamNames.forEach((name) => {
      expect(findTeam(name)).toBeInTheDocument();
    });
  });

  it('shows the computed stat cards', () => {
    render(<Dashboard />);
    const stats = computeStats(mockDashboard);

    expect(screen.getByText(stats.total)).toBeInTheDocument();
    expect(screen.getByText(`${stats.avgCompletion}%`)).toBeInTheDocument();
    expect(screen.getByText(`${stats.toReview}%`)).toBeInTheDocument();
    expect(screen.getByText(`${stats.toStart}%`)).toBeInTheDocument();
  });

  it('filters teams by search text', async () => {
    render(<Dashboard />);

    await userEvent.type(
      screen.getByPlaceholderText('Search by team name'),
      'bad',
    );

    expect(findTeam('Badminton Canada')).toBeInTheDocument();
    expect(findTeam('Basketball Canada')).not.toBeInTheDocument();
  });

  it('shows a message when no teams match', async () => {
    render(<Dashboard />);

    await userEvent.type(
      screen.getByPlaceholderText('Search by team name'),
      'zzz-no-match',
    );

    expect(
      screen.getByText('No NSOs match your search or filters.'),
    ).toBeInTheDocument();
  });

  it('filters teams by the global status filter', async () => {
    render(<Dashboard />);

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
    render(<Dashboard />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Filter Team Size by status' }),
    );
    await userEvent.click(
      screen.getByRole('checkbox', { name: 'Completed' }),
    );

    // Only Team Size === Completed: Swimming, Cycling, and Soccer.
    expect(findTeam('Swimming Canada')).toBeInTheDocument();
    expect(findTeam('Cycling Canada')).toBeInTheDocument();
    expect(findTeam('Soccer Canada')).toBeInTheDocument();
    expect(findTeam('Badminton Canada')).not.toBeInTheDocument();
  });

  it('opens the status overview panel for the clicked step', async () => {
    render(<Dashboard />);

    await userEvent.click(
      screen.getByRole('button', { name: mockDashboard[0].title }),
    );

    expect(screen.getByLabelText('Status Overview Panel')).toBeInTheDocument();
    expect(
      within(screen.getByLabelText('Status Overview Panel')).getByText(
        mockDashboard[0].title,
      ),
    ).toBeInTheDocument();
  });

  it('closes the status overview panel', async () => {
    render(<Dashboard />);

    await userEvent.click(
      screen.getByRole('button', { name: mockDashboard[0].title }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Close panel' }));

    expect(
      screen.queryByLabelText('Status Overview Panel'),
    ).not.toBeInTheDocument();
  });
});
