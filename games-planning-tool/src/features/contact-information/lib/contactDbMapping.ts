// AI contribution: Above 50% AI-generated
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

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};

const toText = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Error('Invalid or missing text field.');
  }
  return value;
};

const toNullableText = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') {
    throw new Error('Invalid text field format.');
  }
  return value;
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
      countryCode: toText(row.countryCode ?? ''),
      phone: toText(row.phone ?? ''),
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
