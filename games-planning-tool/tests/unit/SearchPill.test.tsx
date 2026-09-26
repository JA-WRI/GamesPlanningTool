import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SearchPill } from '@/components/resources/SearchPill';

describe('SearchPill', () => {
  it('renders input with default placeholder and empty value', () => {
    render(<SearchPill value="" onChange={() => {}} />);
    const input = screen.getByPlaceholderText('Search by name, category...');
    expect(input).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders clear button when value is present and triggers clear on click', () => {
    const handleChange = vi.fn();
    render(<SearchPill value="Winter" onChange={handleChange} />);
    const clearBtn = screen.getByRole('button');
    expect(clearBtn).toBeInTheDocument();

    fireEvent.click(clearBtn);
    expect(handleChange).toHaveBeenCalledWith('');
  });

  it('calls onChange with updated text when typing', () => {
    const handleChange = vi.fn();
    render(<SearchPill value="" onChange={handleChange} />);
    const input = screen.getByRole('textbox');

    fireEvent.change(input, { target: { value: 'Curling' } });
    expect(handleChange).toHaveBeenCalledWith('Curling');
  });
});
