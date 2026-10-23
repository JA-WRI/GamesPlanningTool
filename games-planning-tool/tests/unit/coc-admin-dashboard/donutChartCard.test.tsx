//50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DonutChartCard from '../../../src/features/coc-dash/components/chart/DonutChartCard';

// DonutChart needs real layout to render via recharts; the card's own
// behaviour (title, selection state, click handling) doesn't depend on it.
vi.mock(
  '../../../src/app/(application)/[gameId]/(coc)/dashboard/chart/donutChart',
  () => ({
    default: () => <div data-testid="donut" />,
  }),
);

const segments = [{ key: 'a', label: 'Completed', value: 5, color: '#000' }];

describe('DonutChartCard', () => {
  it('renders the title', () => {
    render(
      <DonutChartCard
        title="Team Size"
        segments={segments}
        onClick={() => {}}
        isSelected={false}
      />,
    );

    expect(screen.getByText('Team Size')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    render(
      <DonutChartCard
        title="Team Size"
        segments={segments}
        onClick={onClick}
        isSelected={false}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Team Size' }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('marks itself pressed when selected', () => {
    render(
      <DonutChartCard
        title="Team Size"
        segments={segments}
        onClick={() => {}}
        isSelected={true}
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true');
  });

  it('is not pressed when not selected', () => {
    render(
      <DonutChartCard
        title="Team Size"
        segments={segments}
        onClick={() => {}}
        isSelected={false}
      />,
    );

    expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'false');
  });
});
