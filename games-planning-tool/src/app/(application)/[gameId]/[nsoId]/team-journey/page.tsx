// AI contribution: 50% or more AI-generated
import { notFound } from 'next/navigation';
import TeamJourneyClient from './_components/TeamJourneyClient';
import { getTeamSize } from '@/server/queries/teamSizeDb';
import { getDraftDocument } from '@/lib/draft-actions';
import {
  asDraftNotes,
  asDraftRows,
  DRAFT_SCHEMA_VERSION,
  draftKeys,
} from '@/lib/draft-keys';
import type {
  MedalObjectiveRow,
  MedalRow,
  TeamSizeRow,
} from '@/features/team-size/lib/teamSizeGridLogic';
import type { DisciplineGridRow } from '@/features/team-size/lib/disciplineGridLogic';

type TeamJourneyPageProps = {
  params: Promise<{ gameId: string; nsoId: string }>;
};

// server component, loads the saved team size, the tabs and form state live in TeamJourneyClient
export default async function TeamJourneyPage({
  params,
}: TeamJourneyPageProps) {
  const { gameId, nsoId } = await params;
  const saved = await getTeamSize(gameId, nsoId);
  // the layouts already check the ids, this is just in case
  if (!saved) notFound();

  const keys = {
    estimate: draftKeys.teamJourneyEstimate(gameId, nsoId),
    disciplines: draftKeys.teamJourneyDisciplines(gameId, nsoId),
    performance: draftKeys.teamJourneyPerformance(gameId, nsoId),
    medalPotential: draftKeys.teamJourneyMedalPotential(gameId, nsoId),
    estimateNotes: draftKeys.teamJourneyEstimateNotes(gameId, nsoId),
    disciplineNotes: draftKeys.teamJourneyDisciplineNotes(gameId, nsoId),
  };
  const [
    estimateDraft,
    disciplinesDraft,
    performanceDraft,
    medalPotentialDraft,
    estimateNotesDraft,
    disciplineNotesDraft,
  ] = await Promise.all(
    Object.values(keys).map((key) =>
      getDraftDocument(key, DRAFT_SCHEMA_VERSION),
    ),
  );

  return (
    <TeamJourneyClient
      gameId={gameId}
      nsoId={nsoId}
      saved={saved}
      draftKeys={keys}
      initialDrafts={{
        estimate: asDraftRows<TeamSizeRow>(estimateDraft),
        disciplines: asDraftRows<DisciplineGridRow>(disciplinesDraft),
        performance: asDraftRows<MedalObjectiveRow>(performanceDraft),
        medalPotential: asDraftRows<MedalRow>(medalPotentialDraft),
        estimateNotes: asDraftNotes(estimateNotesDraft),
        disciplineNotes: asDraftNotes(disciplineNotesDraft),
      }}
    />
  );
}
