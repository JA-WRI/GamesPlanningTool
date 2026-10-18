// AI usage -> 80%

// Tests for the NSO dashboard components.
import '@testing-library/jest-dom/vitest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, within } from '@testing-library/react';
import ActionsRequiredCard from '../../../src/components/nso-dashboard/ActionsRequiredCard';
import DashboardPanel from '../../../src/components/nso-dashboard/DashboardPanel';
import DeadlinesAheadCard from '../../../src/components/nso-dashboard/DeadlinesAheadCard';
import PlanningProgressCard from '../../../src/components/nso-dashboard/PlanningProgressCard';

const { chartMock } = vi.hoisted(() => ({ chartMock: vi.fn() }));

vi.mock('../../../src/components/coc-admin-dashboard/chart/donutChart', () => ({
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

  it('keeps the heading and an empty list when there are no actions', () => {
    render(<ActionsRequiredCard actions={[]} />);

    expect(
      screen.getByRole('heading', { name: 'Actions Required' }),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole('list')).queryAllByRole('listitem'),
    ).toHaveLength(0);
  });
});
