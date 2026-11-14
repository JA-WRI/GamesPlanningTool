// AI contribution: 100% AI-generated
import { describe, expect, it } from 'vitest';
import {
  asDraftNotes,
  asDraftRows,
  DRAFT_SCHEMA_VERSION,
  draftKeys,
} from '@/lib/draft-keys';

describe('draftKeys', () => {
  it('creates stable keys that include the relevant record scope', () => {
    expect(draftKeys.nsoContacts('5', 'nso-1')).toBe('contacts:nso:5:nso-1');
    expect(draftKeys.nsoContacts('6', 'nso-1')).not.toBe(
      draftKeys.nsoContacts('5', 'nso-1'),
    );
    expect(draftKeys.nsoContacts('5', 'nso-2')).not.toBe(
      draftKeys.nsoContacts('5', 'nso-1'),
    );
    expect(draftKeys.pgtcDisciplines('5', 'nso-1')).toBe(
      'contacts:pgtc-disciplines:5:nso-1',
    );
    expect(draftKeys.calculatorTravelers(12, '5', 'nso-1')).toBe(
      'calculator:12:travelers:5:nso-1',
    );
    expect(draftKeys.calculatorEstimatedCosts(12, '5', 'nso-1')).toBe(
      'calculator:12:estimated-costs:5:nso-1',
    );
    expect(draftKeys.teamJourneyDisciplines('5', 'nso-1')).toBe(
      'team-journey:5:nso-1:disciplines',
    );
    expect(DRAFT_SCHEMA_VERSION).toBe(1);
  });
});

describe('draft payload parsers', () => {
  it('accepts a row array with unique non-empty string IDs', () => {
    const rows = [{ id: 'one', name: 'draft row' }];

    expect(asDraftRows<(typeof rows)[number]>(rows)).toEqual(rows);
  });

  it.each([
    null,
    {},
    [{ id: '' }],
    [{ id: 1 }],
    [{ id: 'same' }, { id: 'same' }],
  ])('rejects invalid row draft %j', (draft) => {
    expect(asDraftRows(draft)).toBeUndefined();
  });

  it('only accepts notes payloads containing a string', () => {
    expect(asDraftNotes({ notes: 'in progress' })).toBe('in progress');
    expect(asDraftNotes({ notes: 3 })).toBeUndefined();
    expect(asDraftNotes(null)).toBeUndefined();
  });
});
