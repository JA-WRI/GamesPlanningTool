// AI contribution: Below 50% AI-generated (code snippets to debug failing tests)
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GamesTransportationSection from '../../../src/app/(application)/[gameId]/[nsoId]/contact-information/_components/GamesTransportInfo';

describe('GamesTransportationSection', () => {
  it('renders transport header and search input', async () => {
    const user = userEvent.setup();
    render(<GamesTransportationSection />);

    expect(
      screen.getByText('Games Transportation Information'),
    ).toBeInTheDocument();

    expect(
      screen.getByPlaceholderText('Search contacts by name, email, role...'),
    ).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: /Edit/i });
    await user.click(editButton);

    expect(
      screen.getByRole('button', { name: /Add Another Contact/i }),
    ).toBeInTheDocument();
  });
});
