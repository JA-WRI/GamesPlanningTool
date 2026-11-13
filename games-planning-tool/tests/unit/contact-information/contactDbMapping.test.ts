import { describe, expect, it } from 'vitest';
import { nsoContactsToDb } from '@/features/contact-information/lib/contactDbMapping';

const contact = {
  id: 'one',
  role: 'Team Leader',
  firstName: 'Alex',
  lastName: 'Smith',
  email: 'alex@example.com',
  countryCode: '01',
  phone: '00123456789012345678',
};

describe('nsoContactsToDb', () => {
  it('preserves digits and leading zeroes', () => {
    expect(nsoContactsToDb('nso', 1, [contact])).toEqual([
      { ...contact, nsoId: 'nso', gameId: 1, type: 'NSO' },
    ]);
  });

  it('allows empty values', () => {
    expect(
      nsoContactsToDb('nso', 1, [
        { ...contact, countryCode: '', phone: '' },
      ])[0],
    ).toMatchObject({ countryCode: '', phone: '' });
  });

  it.each([
    { countryCode: '+1' },
    { countryCode: '1.5' },
    { phone: '123-456' },
    { phone: '1e3' },
  ])('rejects invalid values: %j', (invalid) => {
    expect(() =>
      nsoContactsToDb('nso', 1, [{ ...contact, ...invalid }]),
    ).toThrow('Country code and phone number must contain only digits.');
  });
});
