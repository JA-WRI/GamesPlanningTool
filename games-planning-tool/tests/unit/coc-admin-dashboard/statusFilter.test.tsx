//50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusFilter from '../../../src/app/(application)/[gameId]/(coc)/dashboard/StatusFilter';

function renderFilter(selected: Parameters<typeof StatusFilter>[0]['selected'] = []) {
  const onChange = vi.fn();
  render(
    <div>
      <button type="button">outside</button>
      <StatusFilter selected={selected} onChange={onChange} />
    </div>,
  );
  return onChange;
}

const openMenu = () =>
  userEvent.click(screen.getByRole('button', { name: 'Filter by status' }));

describe('StatusFilter', () => {
  it('opens and closes from the filter button', async () => {
    renderFilter();

    await openMenu();
    expect(screen.getByText('Clear filters')).toBeInTheDocument();

    await openMenu();
    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('closes when clicking outside the box', async () => {
    renderFilter();

    await openMenu();
    await userEvent.click(screen.getByRole('button', { name: 'outside' }));

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('stays open when clicking inside the box', async () => {
    renderFilter();

    await openMenu();
    await userEvent.click(screen.getByText('Show NSOs with at least one step marked:'));

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('closes on Escape', async () => {
    renderFilter();

    await openMenu();
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('reports a toggled status', async () => {
    const onChange = renderFilter(['Completed']);

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Submitted' }));

    expect(onChange).toHaveBeenCalledWith(['Completed', 'Submitted']);
  });
});
