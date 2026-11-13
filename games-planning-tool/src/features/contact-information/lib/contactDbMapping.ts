// AI contribution: Above 50% AI-generated
import { asRecord, toNullableText, toText } from '@/lib/db-mapping';

export type NsoContactDbRow = {
  id: string;
  nsoId: string;
  gameId: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  countryCode: string;
  phone: string;
};

export type PgtcDisciplineDbRow = {
  id: string;
  nsoId: string;
  gameId: string;
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
  state: string | null;
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

export function nsoContactsToDb(
  nsoId: string,
  gameId: string,
  rows: unknown[],
): NsoContactDbRow[] {
  return rows.map((value) => {
    const row = asRecord(value);
    return {
      id: toText(row.id),
      nsoId,
      gameId,
      role: toText(row.role),
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
  gameId: string,
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
      state: toNullableText(row.state),
      country: toNullableText(row.country),
      travelMethod: toNullableText(row.travelMethod),
      pointOfEntry: toNullableText(row.pointOfEntry),
      additionalNotes: toNullableText(row.additionalNotes),
    };
  });
}
