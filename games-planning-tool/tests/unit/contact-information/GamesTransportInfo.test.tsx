// AI contribution: Above 50% AI-generated (code snippets to debug failing tests and increased testing)
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GamesTransportationSection, {
  ContactRow,
} from '../../../src/app/(application)/[gameId]/[nsoId]/contact-information/_components/GamesTransportInfo';

describe('GamesTransportationSection', () => {
  const initialData: ContactRow[] = [
    {
      id: '1',
      firstName: 'Alice',
      lastName: 'Smith',
      carType: 'SUV',
      role: 'Driver',
      countryCode: '+1',
      phone: '555-0100',
      additionalComments: 'VIP pickup',
    },
    {
      id: '2',
      firstName: 'Bob',
      lastName: 'Jones',
      carType: 'Sedan',
      role: 'Coordinator',
      countryCode: '+44',
      phone: '555-0200',
      additionalComments: 'Late arrival',
    },
  ];

  it('renders transport header, search input, and initial contact rows in view mode[cite: 18]', () => {
    render(<GamesTransportationSection initialData={initialData} />);

    expect(
      screen.getByText('Games Transportation Information'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search contacts by name, email, role...'),
    ).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('filters rows correctly based on the search query input[cite: 18]', async () => {
    const user = userEvent.setup();
    render(<GamesTransportationSection initialData={initialData} />);

    const searchInput = screen.getByPlaceholderText(
      'Search contacts by name, email, role...',
    );
    await user.type(searchInput, 'Alice');

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.queryByText('Bob')).not.toBeInTheDocument();
  });

  it('allows editing transport info and adding new rows in edit mode[cite: 18]', async () => {
    const user = userEvent.setup();
    render(<GamesTransportationSection initialData={initialData} />);

    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    const transportInfoInput = screen.getByPlaceholderText(
      'Enter transport information...',
    );
    await user.type(transportInfoInput, 'Shuttle runs every 30 minutes.');
    expect(transportInfoInput).toHaveValue('Shuttle runs every 30 minutes.');

    const addButton = screen.getByRole('button', {
      name: /Add Another Contact/i,
    });
    expect(addButton).toBeInTheDocument();
    await user.click(addButton);

    const saveButton = screen.getByRole('button', { name: /Save/i });
    await user.click(saveButton);

    expect(
      screen.getByText('Shuttle runs every 30 minutes.'),
    ).toBeInTheDocument();
  });

  it('cancels changes and reverts state[cite: 18]', async () => {
    const user = userEvent.setup();
    render(<GamesTransportationSection initialData={initialData} />);

    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(cancelButton);

    expect(screen.getByRole('button', { name: /Edit/i })).toBeInTheDocument();
  });
});
