//  No substantial AI-generated code
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import NSOInfoPageSection from '../../../src/app/(application)/[gameId]/[nsoId]/contact-information/_components/NSOInfoPage';

describe('NSOInfoPageSection', () => {
  it('renders default NSO general information fields', () => {
    render(<NSOInfoPageSection />);

    expect(screen.getByText('NSO General Information')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Sport')).toBeInTheDocument();
    expect(screen.getByText('Information')).toBeInTheDocument();
    expect(
      screen.getByText('Primary Contact Email Address'),
    ).toBeInTheDocument();
  });
});
