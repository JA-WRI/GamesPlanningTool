import { describe, it, expect } from 'vitest';
import { onlyDigits } from '@/app/(application)/[gameId]/[nsoId]/team-journey/_lib/utils';

describe('onlyDigits', () => {
  it('keeps a number as it is', () => {
    expect(onlyDigits('123')).toBe('123');
  });

  it('returns an empty string for an empty value', () => {
    expect(onlyDigits('')).toBe('');
  });

  it('keeps 0 and leading zeros', () => {
    expect(onlyDigits('0')).toBe('0');
    expect(onlyDigits('007')).toBe('007');
  });

  it('removes letters', () => {
    expect(onlyDigits('12abc3')).toBe('123');
    expect(onlyDigits('abc')).toBe('');
  });

  it('removes minus, plus, dots and spaces', () => {
    expect(onlyDigits('-5')).toBe('5');
    expect(onlyDigits('+5')).toBe('5');
    expect(onlyDigits('1.5')).toBe('15');
    expect(onlyDigits(' 1 2 ')).toBe('12');
  });
});
