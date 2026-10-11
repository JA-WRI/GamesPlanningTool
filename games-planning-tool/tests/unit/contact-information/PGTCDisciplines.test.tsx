//  No substantial AI-generated code
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DisciplinesSection from '../../../src/app/(application)/[gameId]/[nsoId]/contact-information/_components/PGTCDisciplines';

describe('DisciplinesSection', () => {
  it('renders PGTC page title correctly', () => {
    render(<DisciplinesSection />);

    expect(
      screen.getByText(
        'Pre-Games Training Camp (PGTC) Information and Arrivals',
      ),
    ).toBeInTheDocument();
  });
});
