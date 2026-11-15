// No AI contribution
export const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null
    ? (value as Record<string, unknown>)
    : {};

export const toText = (value: unknown): string => {
  if (typeof value !== 'string') {
    throw new Error('Invalid or missing text field.');
  }
  return value;
};

export const toNullableText = (value: unknown): string | null => {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value !== 'string') {
    throw new Error('Invalid text field format.');
  }
  return value;
};
