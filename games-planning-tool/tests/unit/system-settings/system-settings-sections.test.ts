//  More than 50% AI Generated Code
import { describe, expect, it } from 'vitest';
import {
  SETTINGS_SECTIONS,
  countDone,
  sectionHref,
  type SectionCompletion,
} from '@/lib/system-settings-sections';

// Every section set to the same value, then overridden.
function completion(
  value: boolean,
  overrides: Partial<SectionCompletion> = {},
): SectionCompletion {
  return {
    ...(Object.fromEntries(
      SETTINGS_SECTIONS.map((s) => [s.key, value]),
    ) as SectionCompletion),
    ...overrides,
  };
}

describe('sectionHref', () => {
  it('builds the URL of one section of one Game', () => {
    expect(sectionHref(8, 'properties')).toBe(
      '/admin/system-settings/8/properties',
    );
    expect(sectionHref('12', 'game-details')).toBe(
      '/admin/system-settings/12/game-details',
    );
  });
});

describe('SETTINGS_SECTIONS', () => {
  it('has a unique route for every section', () => {
    const keys = SETTINGS_SECTIONS.map((s) => s.key);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe('countDone', () => {
  it('is 0 when no section is complete', () => {
    expect(countDone(completion(false))).toBe(0);
  });

  it('counts every section when all are complete', () => {
    expect(countDone(completion(true))).toBe(SETTINGS_SECTIONS.length);
  });

  it('counts only the complete sections', () => {
    expect(
      countDone(completion(false, { properties: true, 'game-details': true })),
    ).toBe(2);
  });
});
