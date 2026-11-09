// AI contribution: over 50% AI-generated
import { describe, it, expect } from 'vitest';
import {
  baseContactColumns,
  createEmptyContactRow,
} from '@/components/contact-information/ContactGrid';
import { nsoContactColumns } from '../../../src/features/contact-information/components/ContactsGridNSOPage';

describe('createEmptyContactRow', () => {
  it('creates a row with empty fields and no role by default', () => {
    const row = createEmptyContactRow();

    expect(row).toMatchObject({
      firstName: '',
      lastName: '',
      email: '',
      role: '',
      countryCode: '',
      phone: '',
    });
    expect(row.id).toBeTruthy();
  });

  it('sets the given role', () => {
    expect(createEmptyContactRow('Team Leader').role).toBe('Team Leader');
  });

  it('generates a unique id for each row', () => {
    expect(createEmptyContactRow().id).not.toBe(createEmptyContactRow().id);
  });
});

describe('baseContactColumns', () => {
  it('has the expected fields in order', () => {
    expect(baseContactColumns.map((c) => c.field)).toEqual([
      'role',
      'firstName',
      'lastName',
      'email',
      'countryCode',
      'phone',
    ]);
  });

  it('keeps the role column editable', () => {
    const role = baseContactColumns.find((c) => c.field === 'role');
    expect(role?.readOnly).toBeFalsy();
  });
});

describe('nsoContactColumns', () => {
  it('makes only the role column read-only', () => {
    const readOnlyFields = nsoContactColumns
      .filter((c) => c.readOnly)
      .map((c) => c.field);

    expect(readOnlyFields).toEqual(['role']);
  });

  it('does not mutate the shared base columns', () => {
    const role = baseContactColumns.find((c) => c.field === 'role');
    expect(role?.readOnly).toBeFalsy();
  });
});
