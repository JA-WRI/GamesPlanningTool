// Made with AI agents (Antigravity)
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CategoryEditor } from '@/components/resources/CategoryEditor';

describe('CategoryEditor', () => {
  it('renders primary categories and handles toggling', () => {
    const onChange = vi.fn();
    render(
      <CategoryEditor selectedCategories={['General']} onChange={onChange} />,
    );

    // Toggle off existing category
    const generalCheckbox = screen.getByLabelText('General');
    fireEvent.click(generalCheckbox);
    expect(onChange).toHaveBeenCalledWith([]);

    // Toggle on a new category
    const summerGames = screen.getByLabelText('Summer Games');
    fireEvent.click(summerGames);
    expect(onChange).toHaveBeenCalledWith(['General', 'Summer Games']);
  });

  it('filters NSO associations and handles toggling an NSO', () => {
    const onChange = vi.fn();
    render(<CategoryEditor selectedCategories={[]} onChange={onChange} />);

    // Search for a specific NSO
    const searchInput = screen.getByPlaceholderText('Search NSOs...');
    fireEvent.change(searchInput, { target: { value: 'Athletics' } });

    expect(screen.getByText('Athletics Canada')).toBeDefined();

    // Toggle Athletics Canada
    const athleticsCheckbox = screen.getByLabelText('Athletics Canada');
    fireEvent.click(athleticsCheckbox);
    expect(onChange).toHaveBeenCalledWith(['Athletics Canada']);

    // Filter non-existent
    fireEvent.change(searchInput, { target: { value: 'NonExistentXYZ' } });
    expect(screen.getByText('No matching NSOs found.')).toBeDefined();
  });
});
