//50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FilterButton, {
  type FilterOption,
} from '../../../src/components/commons/FilterButton';

const options: FilterOption[] = [
  { label: 'Completed', value: 'Completed', color: 'green' },
  { label: 'Submitted', value: 'Submitted', color: 'blue' },
];

function renderFilter(
  overrides: Partial<Parameters<typeof FilterButton>[0]> = {},
) {
  const onChange = vi.fn();
  render(
    <div>
      <button type="button">outside</button>
      <FilterButton
        options={options}
        selected={[]}
        onChange={onChange}
        {...overrides}
      />
    </div>,
  );
  return onChange;
}

const openMenu = (name = 'Filter options') =>
  userEvent.click(screen.getByRole('button', { name }));

describe('FilterButton', () => {
  it('uses the default aria-label and description', async () => {
    renderFilter();

    await openMenu();

    expect(
      screen.getByText('Select the options to display:'),
    ).toBeInTheDocument();
  });

  it('uses a custom aria-label and description', async () => {
    renderFilter({
      ariaLabel: 'Filter by status',
      description: 'Pick a status:',
    });

    await openMenu('Filter by status');

    expect(screen.getByText('Pick a status:')).toBeInTheDocument();
  });

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

  it('closes on Escape', async () => {
    renderFilter();

    await openMenu();
    await userEvent.keyboard('{Escape}');

    expect(screen.queryByText('Clear filters')).not.toBeInTheDocument();
  });

  it('lists every option with its label', async () => {
    renderFilter();

    await openMenu();

    options.forEach((option) => {
      expect(
        screen.getByRole('checkbox', { name: option.label }),
      ).toBeInTheDocument();
    });
  });

  it('reports a toggled option as selected', async () => {
    const onChange = renderFilter({ selected: ['Completed'] });

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Submitted' }));

    expect(onChange).toHaveBeenCalledWith(['Completed', 'Submitted']);
  });

  it('reports a toggled option as removed', async () => {
    const onChange = renderFilter({ selected: ['Completed', 'Submitted'] });

    await openMenu();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Completed' }));

    expect(onChange).toHaveBeenCalledWith(['Submitted']);
  });

  it('clears all selections', async () => {
    const onChange = renderFilter({ selected: ['Completed', 'Submitted'] });

    await openMenu();
    await userEvent.click(screen.getByText('Clear filters'));

    expect(onChange).toHaveBeenCalledWith([]);
  });

  it('disables "Clear filters" when nothing is selected', async () => {
    renderFilter({ selected: [] });

    await openMenu();

    expect(screen.getByText('Clear filters')).toBeDisabled();
  });

  it('shows a badge with the number of selected options', () => {
    renderFilter({ selected: ['Completed', 'Submitted'] });

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders a smaller button when compact', () => {
    renderFilter({ ariaLabel: 'Filter options', compact: true });

    expect(screen.getByRole('button', { name: 'Filter options' })).toHaveClass(
      'h-6',
      'w-6',
    );
  });

  it('renders a full-size button by default', () => {
    renderFilter();

    expect(screen.getByRole('button', { name: 'Filter options' })).toHaveClass(
      'h-10',
      'w-10',
    );
  });
});
