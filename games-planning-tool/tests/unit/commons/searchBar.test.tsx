// AI usage -> 100%
// to test the search bar component
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchBar from '../../../../games-planning-tool/src/components/commons/SearchBar';

describe('SearchBar', () => {
  it('renders the default placeholder', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    expect(screen.getByPlaceholderText('Type to search')).toBeInTheDocument();
  });

  it('renders a custom placeholder', () => {
    render(
      <SearchBar
        value=""
        onChange={() => {}}
        placeholder="Search by name..."
      />,
    );

    expect(
      screen.getByPlaceholderText('Search by name...'),
    ).toBeInTheDocument();
  });

  it('displays the value it is given', () => {
    render(<SearchBar value="Badminton" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveValue('Badminton');
  });

  it('calls onChange with the typed text', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    await user.type(screen.getByRole('textbox'), 'a');

    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(handleChange).toHaveBeenCalledWith('a');
  });

  it('calls onChange once per keystroke', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);

    await user.type(screen.getByRole('textbox'), 'abc');

    expect(handleChange).toHaveBeenCalledTimes(3);
  });

  it('is a plain text input', () => {
    render(<SearchBar value="" onChange={() => {}} />);

    expect(screen.getByRole('textbox')).toHaveAttribute('type', 'text');
  });

  it('renders the search icon', () => {
    const { container } = render(<SearchBar value="" onChange={() => {}} />);

    expect(container.querySelector('svg')).toBeInTheDocument();
  });
});
