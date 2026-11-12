// AI contribution: Below 50% AI-generated
// Need to be updated later
export const DRAFT_SCHEMA_VERSION = 1;

export const draftKeys = {
  nsoContacts: 'contacts:nso',
  pgtcDisciplines: 'contacts:pgtc-disciplines',
  calculatorTravelers: (calculatorId: number, gameId: string, nsoId: string) =>
    `calculator:${calculatorId}:travelers:${gameId}:${nsoId}`,
  calculatorEstimatedCosts: (
    calculatorId: number,
    gameId: string,
    nsoId: string,
  ) => `calculator:${calculatorId}:estimated-costs:${gameId}:${nsoId}`,
  teamJourneyEstimate: (gameId: string, nsoId: string) =>
    `team-journey:${gameId}:${nsoId}:estimate`,
  teamJourneyDisciplines: (gameId: string, nsoId: string) =>
    `team-journey:${gameId}:${nsoId}:disciplines`,
  teamJourneyPerformance: (gameId: string, nsoId: string) =>
    `team-journey:${gameId}:${nsoId}:performance`,
  teamJourneyMedalPotential: (gameId: string, nsoId: string) =>
    `team-journey:${gameId}:${nsoId}:medal-potential`,
  teamJourneyEstimateNotes: (gameId: string, nsoId: string) =>
    `team-journey:${gameId}:${nsoId}:estimate-notes`,
  teamJourneyDisciplineNotes: (gameId: string, nsoId: string) =>
    `team-journey:${gameId}:${nsoId}:discipline-notes`,
};

export function asDraftRows<Row extends { id: string }>(
  value: unknown,
): Row[] | undefined {
  if (
    !Array.isArray(value) ||
    !value.every(
      (row) =>
        typeof row === 'object' &&
        row !== null &&
        'id' in row &&
        typeof row.id === 'string' &&
        row.id.length > 0,
    )
  ) {
    return undefined;
  }

  const ids = value.map((row) => row.id);
  if (new Set(ids).size !== ids.length) return undefined;
  return value as Row[];
}

export function asDraftNotes(value: unknown): string | undefined {
  return typeof value === 'object' &&
    value !== null &&
    'notes' in value &&
    typeof value.notes === 'string'
    ? value.notes
    : undefined;
}
