//no substantial AI generated code
export const SETTINGS_SECTIONS = [
  { key: 'example-setup', label: 'Example' },
  { key: 'game-details', label: 'Details' },
  { key: 'participating-nsos', label: 'NSOs' },
  { key: 'properties', label: 'Properties & Prices' },
  { key: 'estimated-costs', label: 'Calculator Rates' },
  { key: 'accreditation-types', label: 'Accreditation Types' },
  { key: 'planning-deadlines', label: 'Deadlines' },
] as const;

export type SettingsSectionRoute = (typeof SETTINGS_SECTIONS)[number]['key'];

//true when a section is complete, false otherwise
export type SectionCompletion = Record<SettingsSectionRoute, boolean>;

//used to make each config url for the stepper
export function sectionHref(
  gameId: string | number,
  key: SettingsSectionRoute,
) {
  return `/admin/system-settings/${gameId}/${key}`;
}

// How many sections are done, for the progress bar.
export function countDone(completion: SectionCompletion) {
  return SETTINGS_SECTIONS.filter((s) => completion[s.key]).length;
}
