// AI contribution: over 50% AI-generated (code snippets to debug failing tests)
'use client';

import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';

const draftActions = vi.hoisted(() => ({
  saveDraftDocument: vi.fn().mockResolvedValue(undefined),
  deleteDraftDocument: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/draft-actions', () => draftActions);

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

  it('normalizes existing phone formatting and saves digit strings with leading zeroes', async () => {
    const onSaveAction = vi.fn().mockResolvedValue([]);
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={['Media Attaché']}
        initialData={[{ ...savedContact, countryCode: '+01' }]}
        onSaveAction={onSaveAction}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    const country = screen.getByPlaceholderText('Enter Country Code');
    const phone = screen.getByPlaceholderText('Enter Phone Number');
    expect(country).toHaveValue('01');
    expect(phone).toHaveValue('5145550188');

    fireEvent.change(country, { target: { value: '00x1' } });
    fireEvent.change(phone, { target: { value: '0012e3' } });
    expect(screen.getAllByText('Use digits only')).toHaveLength(2);
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSaveAction).not.toHaveBeenCalled();

    fireEvent.change(country, { target: { value: '001' } });
    fireEvent.change(phone, { target: { value: '00123456789012345678' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(onSaveAction).toHaveBeenCalledOnce());
    expect(onSaveAction).toHaveBeenCalledWith([
      expect.objectContaining({
        countryCode: '001',
        phone: '00123456789012345678',
      }),
    ]);
    alert.mockRestore();
  });

  it('prevents saving invalid phone values hidden by search', () => {
    const onSaveAction = vi.fn();
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
        initialData={[savedContact]}
        onSaveAction={onSaveAction}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
    fireEvent.change(screen.getAllByPlaceholderText('Enter Phone Number')[0], {
      target: { value: '12x' },
    });

    fireEvent.change(
      screen.getByPlaceholderText('Search contacts by name, email, role...'),
      { target: { value: 'Team Leader' } },
    );
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    expect(onSaveAction).not.toHaveBeenCalled();
    expect(alert).toHaveBeenCalledWith(
      'Please fix the invalid range inputs before saving.',
    );
    alert.mockRestore();
  });

  it.each([
    ['phone', 'Enter Phone Number'],
    ['countryCode', 'Enter Country Code'],
  ])(
    'does not autosave an invalid %s and resumes after correction',
    async (field, placeholder) => {
      vi.useFakeTimers();
      draftActions.saveDraftDocument.mockClear();
      try {
        render(
          <ContactsGridNSOPage
            title="NSO Contacts"
            description="Manage NSO contact records."
            roles={['Media Attaché']}
            initialData={[savedContact]}
            draftKey="contacts:nso"
          />,
        );
        fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
        const input = screen.getByPlaceholderText(placeholder);
        fireEvent.change(input, { target: { value: '12x' } });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(800);
        });
        expect(input).toHaveValue('12x');
        expect(screen.getByRole('status')).toHaveTextContent(
          'Fix invalid inputs. Draft not saved',
        );
        expect(draftActions.saveDraftDocument).not.toHaveBeenCalled();

        fireEvent.change(input, { target: { value: '0123' } });
        await act(async () => {
          await vi.advanceTimersByTimeAsync(800);
        });
        expect(draftActions.saveDraftDocument).toHaveBeenCalledWith(
          'contacts:nso',
          [expect.objectContaining({ [field]: '0123' })],
          1,
        );
        expect(screen.getByRole('status')).toHaveTextContent('Draft saved');
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('displays a refreshed persisted draft when the page receives it again', () => {
    const { rerender } = render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
        initialData={[savedContact]}
        draftKey="contacts:nso"
      />,
    );

    rerender(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
        initialData={[savedContact]}
        initialDraft={[{ ...savedContact, firstName: 'Draft name' }]}
        draftKey="contacts:nso"
      />,
    );

    expect(screen.getByText('Draft restored')).toBeInTheDocument();
    expect(screen.getByText('Draft name')).toBeInTheDocument();
    expect(screen.getByText('Team Leader')).toBeInTheDocument();
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

  it('filters rows accurately across name, email, phone, and role columns', () => {
    const secondContact = {
      id: '2',
      firstName: 'Marcus',
      lastName: 'Oyelaran',
      email: 'moyelaran@olympic.ca',
      role: 'Team Leader',
      countryCode: '1',
      phone: '416-555-9876',
    };

    render(
      <ContactsGridNSOPage
        title="NSO Contacts"
        description="Manage NSO contact records."
        roles={roles}
        initialData={[savedContact, secondContact]}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      'Search contacts by name, email, role...',
    );

    fireEvent.change(searchInput, { target: { value: '555-0188' } });
    expect(screen.getByText('Janiyah')).toBeInTheDocument();
    expect(screen.queryByText('Marcus')).not.toBeInTheDocument();
    expect(screen.queryByText('Chef de Mission')).not.toBeInTheDocument();

    fireEvent.change(searchInput, {
      target: { value: 'moyelaran@olympic.ca' },
    });
    expect(screen.queryByText('Janiyah')).not.toBeInTheDocument();
    expect(screen.getByText('Marcus')).toBeInTheDocument();
    expect(screen.getByText('Team Leader')).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: 'Chef de Mission' } });
    expect(screen.getByText('Chef de Mission')).toBeInTheDocument();
    expect(screen.queryByText('Janiyah')).not.toBeInTheDocument();
    expect(screen.queryByText('Marcus')).not.toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: '' } });
    expect(screen.getByText('Janiyah')).toBeInTheDocument();
    expect(screen.getByText('Marcus')).toBeInTheDocument();
    expect(screen.getByText('Chef de Mission')).toBeInTheDocument();
  });
});
