// AI contribution: Above 50% AI-generated
import { asRecord, toNullableText, toText } from '@/lib/db-mapping';

export type NsoContactDbRow = {
  id: string;
  nsoId: string;
  gameId: number;
  role: string;
  type: 'NSO';
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
};

export type PgtcDisciplineDbRow = {
  id: string;
  nsoId: string;
  gameId: number;
  name: string;
  arrivalDate: string | null;
  arrivalTime: string | null;
  departureDate: string | null;
  departureTime: string | null;
  accommodationName: string | null;
  streetName: string | null;
  streetNumber: string | null;
  zipCode: string | null;
  city: string | null;
  stateOrProvince: string | null;
  country: string | null;
  travelMethod: string | null;
  pointOfEntry: string | null;
  additionalNotes: string | null;
};

const toDigits = (value: unknown): string => {
  const text = toText(value ?? '');
  if (text !== '' && !/^[0-9]+$/.test(text)) {
    throw new Error('Country code and phone number must contain only digits.');
  }
  return text;
};

export function parseGameId(gameId: string): number {
  const parsed = Number(gameId);
  if (
    !/^[1-9]\d*$/.test(gameId) ||
    !Number.isSafeInteger(parsed) ||
    parsed > 2147483647
  ) {
    throw new Error('Invalid game ID.');
  }
  return parsed;
}

export function nsoContactsToDb(
  nsoId: string,
  gameId: number,
  rows: unknown[],
): NsoContactDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      nsoId,
      gameId,
      role: toText(row.role),
      type: 'NSO',
      firstName: toText(row.firstName),
      lastName: toText(row.lastName),
      email: toText(row.email),
      countryCode: toDigits(row.countryCode),
      phone: toDigits(row.phone),
    };
  });
}

export function pgtcDisciplinesToDb(
  nsoId: string,
  gameId: number,
  rows: unknown[],
): PgtcDisciplineDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      nsoId,
      gameId,
      name: toText(row.name),
      arrivalDate: toNullableText(row.arrivalDate),
      arrivalTime: toNullableText(row.arrivalTime),
      departureDate: toNullableText(row.departureDate),
      departureTime: toNullableText(row.departureTime),
      accommodationName: toNullableText(row.accommodationName),
      streetName: toNullableText(row.streetName),
      streetNumber: toNullableText(row.streetNumber),
      zipCode: toNullableText(row.zipCode),
      city: toNullableText(row.city),
      stateOrProvince: toNullableText(row.state),
      country: toNullableText(row.country),
      travelMethod: toNullableText(row.travelMethod),
      pointOfEntry: toNullableText(row.pointOfEntry),
      additionalNotes: toNullableText(row.additionalNotes),
    };
  });
}
