//50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusOverviewPanel from '../../../src/app/(application)/[gameId]/(coc)/dashboard/_components/StatusOverviewPanel';
import type { Status } from '../../../src/components/commons/status';

// Recharts needs real layout; the panel's behaviour doesn't depend on it.
vi.mock(
  '../../../src/app/(application)/[gameId]/(coc)/dashboard/chart/donutChart',
  () => ({
    default: () => <div data-testid="donut" />,
  }),
);

const counts = {
  'Not Started': 2,
  'In Progress': 1,
  Completed: 7,
  Submitted: 0,
  'Requires Update': 0,
};

const names: Record<Status, string[]> = {
  'Not Started': ['A', 'B'],
  'In Progress': ['C'],
  Completed: ['N1', 'N2', 'N3', 'N4', 'N5', 'N6', 'N7'],
  Submitted: [],
  'Requires Update': [],
};

function renderPanel(onClose = vi.fn()) {
  render(
    <StatusOverviewPanel
      stepTitle="Team Size"
      counts={counts}
      nsoNamesByStatus={names}
      onClose={onClose}
    />,
  );
  return onClose;
}

describe('StatusOverviewPanel', () => {
  it('shows the step title and completion summary', () => {
    renderPanel();

    expect(screen.getByText('Team Size')).toBeInTheDocument();
    expect(screen.getByText('7 of 10 completed')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('lists completed NSOs by default, collapsing past five', async () => {
    renderPanel();

    expect(screen.getByText('N5')).toBeInTheDocument();
    expect(screen.queryByText('N6')).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Show 2 more NSOs' }),
    );
    expect(screen.getByText('N7')).toBeInTheDocument();
  });

  it('switches status when a status chip is clicked', async () => {
    renderPanel();

    // The chip comes before the pager button in the DOM
    await userEvent.click(
      screen.getAllByRole('button', { name: 'Not Started' })[0],
    );

    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.queryByText('N1')).not.toBeInTheDocument();
  });

  it('shows an empty message for a status with no NSOs', async () => {
    renderPanel();

    await userEvent.click(screen.getByRole('button', { name: 'Submitted' }));

    expect(screen.getByText('No NSOs with this status.')).toBeInTheDocument();
  });

  it('pages to the neighbouring statuses', async () => {
    renderPanel();

    // Completed sits between Not Started and In Progress
    await userEvent.click(
      screen.getAllByRole('button', { name: /In Progress/ }).at(-1)!,
    );

    expect(screen.getByText('C')).toBeInTheDocument();
  });

  it('calls onClose from the close button', async () => {
    const onClose = renderPanel();

    await userEvent.click(screen.getByRole('button', { name: 'Close panel' }));

    expect(onClose).toHaveBeenCalledOnce();
  });
});
