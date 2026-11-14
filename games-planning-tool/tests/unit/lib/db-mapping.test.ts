// AI contribution: 100% AI-generated
import { describe, expect, it } from 'vitest';
import { asRecord, toNullableText, toText } from '@/lib/db-mapping';

describe('asRecord', () => {
  it('returns an object unchanged', () => {
    const value = { id: 'one', count: 2 };
    expect(asRecord(value)).toBe(value);
  });

  it('returns an array unchanged because it is an object', () => {
    const value = ['one'];
    expect(asRecord(value)).toBe(value);
  });

  it.each([null, undefined, 'text', 123, false])(
    'returns an empty record for %s',
    (value) => {
      expect(asRecord(value)).toEqual({});
    },
  );
});

describe('toText', () => {
  it.each(['text', '', '  text  '])('preserves the string %j', (value) => {
    expect(toText(value)).toBe(value);
  });

  it.each([null, undefined, 123, false, {}])(
    'rejects non-string value %s',
    (value) => {
      expect(() => toText(value)).toThrow('Invalid or missing text field.');
    },
  );
});

describe('toNullableText', () => {
  it.each([null, undefined, ''])('maps %s to null', (value) => {
    expect(toNullableText(value)).toBeNull();
  });

  it.each(['text', '  text  ', ' '])(
    'preserves the nonempty string %j',
    (value) => {
      expect(toNullableText(value)).toBe(value);
    },
  );

  it.each([123, false, {}])('rejects non-string value %s', (value) => {
    expect(() => toNullableText(value)).toThrow('Invalid text field format.');
  });
});
