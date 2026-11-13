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
    expect(nsoContactsToDb('nso', 'game', [contact])).toEqual([
      { ...contact, nsoId: 'nso', gameId: 'game' },
    ]);
  });

  it('allows empty values', () => {
    expect(
      nsoContactsToDb('nso', 'game', [
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
      nsoContactsToDb('nso', 'game', [{ ...contact, ...invalid }]),
    ).toThrow('Country code and phone number must contain only digits.');
  });
});
