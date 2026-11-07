// AI contribution: Below 50% AI-generated (code snippets to debug failing tests)
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactsGridCOCPage from '../../../src/features/contact-information/components/ContactsGridCOCPage';

describe('ContactsGridPage', () => {
  it('renders base grid page with correct title and initial data', () => {
    render(
      <ContactsGridCOCPage
        title="COC Contacts"
        description="Manage COC contact records."
      />,
    );

    expect(screen.getByText('COC Contacts')).toBeInTheDocument();
    expect(screen.getByText('Manage COC contact records.')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search contacts by name, email, role...'),
    ).toBeInTheDocument();
  });
});
