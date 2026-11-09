// AI contribution: over 50% AI-generated (code snippets to debug failing tests)
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import ContactsGridNSOPage from '../../../src/features/contact-information/components/ContactsGridNSOPage';

const roles = ['Media Attaché', 'Team Leader', 'Chef de Mission'];

const savedContact = {
  id: '1',
  firstName: 'Janiyah',
  lastName: 'Conner',
  email: 'jconner@olympic.ca',
  role: 'Media Attaché',
  countryCode: '1',
  phone: '514-555-0188',
};

describe('ContactsGridNSOPage', () => {
  it('renders base grid page with correct title, description and search bar', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
      />,
    );

    expect(screen.getByText('NSO Contacts')).toBeInTheDocument();
    expect(screen.getByText('Manage NSO contact records.')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Search contacts by name, email, role...'),
    ).toBeInTheDocument();
  });

  it('renders one row per role', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
      />,
    );

    roles.forEach((role) => {
      expect(screen.getByText(role)).toBeInTheDocument();
    });

    expect(screen.getAllByRole('row')).toHaveLength(roles.length + 1);
  });

  it('shows the role column first', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
      />,
    );

    const headers = screen.getAllByRole('columnheader');
    expect(headers[0]).toHaveTextContent('Role');
  });

  it('prefills the row whose role matches the saved contact', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
        initialData={[savedContact]}
      />,
    );

    expect(screen.getByText('Janiyah')).toBeInTheDocument();
    expect(screen.getByText('Conner')).toBeInTheDocument();
    expect(screen.getByText('jconner@olympic.ca')).toBeInTheDocument();
    expect(screen.getByText('514-555-0188')).toBeInTheDocument();
  });

  it('does not show saved contacts whose role is not in the roles list', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={['Team Leader']}
        initialData={[savedContact]}
      />,
    );

    expect(screen.queryByText('Janiyah')).not.toBeInTheDocument();
    expect(screen.getByText('Team Leader')).toBeInTheDocument();
  });

  it('shows a dash for empty cells in roles without saved data', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={['Team Leader']}
      />,
    );

    expect(screen.getAllByText('-')).toHaveLength(5);
  });

  it('does not show an add row button', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
      />,
    );

    expect(
      screen.queryByRole('button', { name: /add/i }),
    ).not.toBeInTheDocument();
  });

  it('filters rows with the search bar', () => {
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
        initialData={[savedContact]}
      />,
    );

    fireEvent.change(
      screen.getByPlaceholderText('Search contacts by name, email, role...'),
      { target: { value: 'Janiyah' } },
    );

    expect(screen.getByText('Janiyah')).toBeInTheDocument();
    expect(screen.queryByText('Team Leader')).not.toBeInTheDocument();
    expect(screen.queryByText('Chef de Mission')).not.toBeInTheDocument();
  });
});
