// AI contribution: Above 50% AI-generated (AI used to provide more coverage)
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DisciplinesSection, {
  DisciplineData,
} from '../../../src/app/(application)/[gameId]/[nsoId]/contact-information/_components/PGTCDisciplines';

describe('DisciplinesSection', () => {
  const initialDisciplines: DisciplineData[] = [
    {
      id: 'disc-1',
      name: 'Athletics',
      arrivalDate: '2026-07-01',
      arrivalTime: '10:00',
      departureDate: '2026-07-10',
      departureTime: '18:00',
      accommodationName: 'Grand Hotel',
      streetName: 'Main St',
      streetNumber: '123',
      zipCode: '12345',
      city: 'Paris',
      state: 'Île-de-France',
      country: 'France',
      travelMethod: 'Flight',
      pointOfEntry: 'CDG',
      additionalNotes: 'None',
    },
  ];

  it('renders PGTC page title and discipline details in view mode', () => {
    render(<DisciplinesSection initialDisciplines={initialDisciplines} />);

    expect(
      screen.getByText(
        'Pre-Games Training Camp (PGTC) Information and Arrivals',
      ),
    ).toBeInTheDocument();
    expect(screen.getByText('Athletics')).toBeInTheDocument();
    expect(screen.getByText('Grand Hotel')).toBeInTheDocument();
    expect(screen.getByText('Flight')).toBeInTheDocument();
  });

  it('allows editing discipline fields and adding a new discipline when in edit mode', () => {
    render(<DisciplinesSection initialDisciplines={initialDisciplines} />);

    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);

    const nameInput = screen.getByDisplayValue('Athletics');
    expect(nameInput).toBeInTheDocument();

    fireEvent.change(nameInput, { target: { value: 'Swimming' } });
    expect(screen.getByDisplayValue('Swimming')).toBeInTheDocument();

    const addButton = screen.getByRole('button', {
      name: /Add New Discipline/i,
    });
    expect(addButton).toBeInTheDocument();

    fireEvent.click(addButton);

    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);

    expect(screen.getByText('Swimming')).toBeInTheDocument();
  });
});
