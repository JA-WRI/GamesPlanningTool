// AI usage -> 80%

// Tests for the NSO dashboard components.
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import ActionsRequiredCard from '../../../src/components/nso-dashboard/ActionsRequiredCard';
import DashboardPanel from '../../../src/components/nso-dashboard/DashboardPanel';
import AnnouncementsCard from '@/components/nso-dashboard/AnnouncementsCard';
import PlanningProgressCard from '@/components/nso-dashboard/PlanningProgressCard';

const { chartMock } = vi.hoisted(() => ({ chartMock: vi.fn() }));

vi.mock('@/components/commons/DonutChart', () => ({
  default: chartMock,
}));

beforeEach(() => {
  chartMock.mockReset();
  chartMock.mockReturnValue(null);
});

afterEach(() => {
  cleanup();
});

describe('DashboardPanel', () => {
  it('renders its heading and children as a named section', () => {
    render(
      <DashboardPanel id="example-heading" title="Example panel">
        <p>Panel content</p>
      </DashboardPanel>,
    );

    const section = screen.getByRole('region', { name: 'Example panel' });
    expect(within(section).getByRole('heading', { level: 2 })).toHaveAttribute(
      'id',
      'example-heading',
    );
    expect(within(section).getByText('Panel content')).toBeInTheDocument();
  });

  it('accepts an additional layout class without losing its children', () => {
    render(
      <DashboardPanel
        id="resources-heading"
        title="Resources"
        className="col-span-full"
      >
        <p>Resource content</p>
      </DashboardPanel>,
    );

    const section = screen.getByRole('region', { name: 'Resources' });
    expect(section).toHaveClass('col-span-full');
    expect(within(section).getByText('Resource content')).toBeInTheDocument();
  });
});

describe('ActionsRequiredCard', () => {
  it('renders the supplied actions in order with their descriptions and numbering', () => {
    render(
      <ActionsRequiredCard
        actions={[
          {
            id: 'travel',
            title: 'Review travel',
            description: 'Confirm arrival details.',
          },
          {
            id: 'team',
            title: 'Confirm team',
            description: 'Review participant numbers.',
          },
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Actions Required', level: 2 }),
    ).toBeInTheDocument();
    const rows = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(rows).toHaveLength(2);
    expect(
      within(rows[0]).getByRole('heading', { name: 'Review travel' }),
    ).toBeInTheDocument();
    expect(
      within(rows[0]).getByText('Confirm arrival details.'),
    ).toBeInTheDocument();
    expect(within(rows[0]).getByText('1')).toBeInTheDocument();
    expect(
      within(rows[1]).getByRole('heading', { name: 'Confirm team' }),
    ).toBeInTheDocument();
    expect(
      within(rows[1]).getByText('Review participant numbers.'),
    ).toBeInTheDocument();
    expect(within(rows[1]).getByText('2')).toBeInTheDocument();
  });

  it('shows a message when no actions are required', () => {
    render(<ActionsRequiredCard actions={[]} />);

    expect(
      screen.getByRole('heading', { name: 'Actions Required' }),
    ).toBeInTheDocument();

    expect(screen.getByText('No actions required.')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('AnnouncementsCard', () => {
  it('shows dates and renders a description only when one is provided', () => {
    render(
      <AnnouncementsCard
        announcements={[
          {
            id: 'venue-update',
            title: 'Training schedule released',
            body: 'Check your assigned practice time.',
            publishedAt: '2026-11-07',
          },
          {
            id: 'travel-update',
            title: 'Travel update',
            body: null,
            publishedAt: '2026-11-06',
          },
        ]}
      />,
    );

    const section = screen.getByRole('region', { name: 'Announcements' });
    const [withBody, withoutBody] = within(section).getAllByRole('listitem');

    expect(
      within(withBody).getByRole('heading', {
        name: 'Training schedule released',
      }),
    ).toBeInTheDocument();
    expect(
      within(withBody).getByText('Check your assigned practice time.'),
    ).toBeInTheDocument();
    expect(within(withBody).getByRole('time')).toHaveAttribute(
      'datetime',
      '2026-11-07',
    );

    expect(
      within(withoutBody).getByRole('heading', { name: 'Travel update' }),
    ).toBeInTheDocument();
    expect(within(withoutBody).getByRole('time')).toHaveAttribute(
      'datetime',
      '2026-11-06',
    );
    expect(
      within(withoutBody).queryByRole('paragraph'),
    ).not.toBeInTheDocument();
  });
});

describe('PlanningProgressCard', () => {
  it('shows completion and legend percentages for a mix of task statuses', () => {
    render(
      <PlanningProgressCard
        counts={{
          COMPLETE: 1,
          SUBMITTED: 0,
          ACTION_REQUIRED: 0,
          IN_PROGRESS: 3,
          NOT_STARTED: 0,
        }}
      />,
    );

    expect(
      screen.getByRole('heading', {
        level: 2,
        name: /planning progress.*25% complete/i,
      }),
    ).toBeInTheDocument();
    expect(screen.getByText('Complete (25%)')).toBeInTheDocument();
    expect(screen.getByText('In Progress (75%)')).toBeInTheDocument();
  });

  it('explains why an empty plan has no chart', () => {
    render(
      <PlanningProgressCard
        counts={{
          COMPLETE: 0,
          SUBMITTED: 0,
          ACTION_REQUIRED: 0,
          IN_PROGRESS: 0,
          NOT_STARTED: 0,
        }}
      />,
    );

    expect(
      screen.getByText(
        'No planning tasks yet. Your progress will appear here once tasks are added.',
      ),
    ).toBeInTheDocument();

    expect(chartMock).not.toHaveBeenCalled();
  });

  it('shows the breakdown when tasks exist but none are complete', () => {
    render(
      <PlanningProgressCard
        counts={{
          COMPLETE: 0,
          SUBMITTED: 0,
          ACTION_REQUIRED: 1,
          IN_PROGRESS: 3,
          NOT_STARTED: 0,
        }}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: /planning progress.*0% complete/i,
      }),
    ).toBeInTheDocument();

    expect(screen.getByText('Required Actions (25%)')).toBeInTheDocument();
    expect(screen.getByText('In Progress (75%)')).toBeInTheDocument();
    expect(chartMock).toHaveBeenCalled();
  });
});
