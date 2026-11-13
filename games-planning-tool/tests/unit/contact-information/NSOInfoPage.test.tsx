// AI contribution: over 50% AI-generated
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import NSOInfoPageSection from '../../../src/features/contact-information/components/NSOInfoPage';

const savedInfo = {
  name: 'Canadian Swimming',
  sport: 'Swimming',
  primaryContactEmail: 'info@swimming.ca',
};

describe('NSOInfoPageSection', () => {
  it('renders default NSO general information fields', () => {
    render(<NSOInfoPageSection />);

    expect(screen.getByText('NSO General Information')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Sport')).toBeInTheDocument();
    expect(
      screen.getByText('Primary Contact Email Address'),
    ).toBeInTheDocument();
  });

  it('shows "Not provided" for empty fields', () => {
    render(<NSOInfoPageSection />);

    expect(screen.getAllByText('Not provided')).toHaveLength(3);
  });

  it('shows initial data as plain text, not inputs, by default', () => {
    render(<NSOInfoPageSection initialData={savedInfo} />);

    expect(screen.getByText('Canadian Swimming')).toBeInTheDocument();
    expect(screen.getByText('Swimming')).toBeInTheDocument();
    expect(screen.getByText('info@swimming.ca')).toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  describe('when editable', () => {
    it('shows inputs after clicking edit', () => {
      render(<NSOInfoPageSection initialData={savedInfo} readOnly={false} />);

      fireEvent.click(screen.getByRole('button', { name: /edit/i }));

      expect(screen.getByPlaceholderText('Enter name')).toHaveValue(
        'Canadian Swimming',
      );
      expect(screen.getByPlaceholderText('Enter sport')).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText('Enter email address'),
      ).toBeInTheDocument();
    });
  });
  describe('when readOnly', () => {
    it('still renders the title, labels and saved values', () => {
      render(<NSOInfoPageSection initialData={savedInfo} readOnly />);

      expect(screen.getByText('NSO General Information')).toBeInTheDocument();
      expect(screen.getByText('Name')).toBeInTheDocument();
      expect(screen.getByText('Canadian Swimming')).toBeInTheDocument();
      expect(screen.getByText('Swimming')).toBeInTheDocument();
      expect(screen.getByText('info@swimming.ca')).toBeInTheDocument();
    });

    it('does not show an edit button', () => {
      render(<NSOInfoPageSection initialData={savedInfo} readOnly />);

      expect(
        screen.queryByRole('button', { name: /edit/i }),
      ).not.toBeInTheDocument();
    });

    it('does not show save or cancel buttons', () => {
      render(<NSOInfoPageSection initialData={savedInfo} readOnly />);

      expect(
        screen.queryByRole('button', { name: /save/i }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /cancel/i }),
      ).not.toBeInTheDocument();
    });

    it('never renders inputs', () => {
      render(<NSOInfoPageSection initialData={savedInfo} readOnly />);

      expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
      expect(
        screen.queryByPlaceholderText('Enter name'),
      ).not.toBeInTheDocument();
    });

    it('shows "Not provided" for empty fields', () => {
      render(<NSOInfoPageSection readOnly />);

      expect(screen.getAllByText('Not provided')).toHaveLength(3);
    });
  });
});
