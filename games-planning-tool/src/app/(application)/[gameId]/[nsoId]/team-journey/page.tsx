// AI contribution: 50% or more AI-generated
import { notFound } from 'next/navigation';
import TeamJourneyClient from './_components/TeamJourneyClient';
import { getTeamSize } from '@/server/queries/teamSizeDb';
import { getMedalRows } from '@/server/queries/medalPotentialDb';

type TeamJourneyPageProps = {
  params: Promise<{ gameId: string; nsoId: string }>;
};

// server component, loads the saved team size and athletes, the tabs and form state live in TeamJourneyClient
export default async function TeamJourneyPage({
  params,
}: TeamJourneyPageProps) {
  const { gameId, nsoId } = await params;
  const [teamSize, medalRows] = await Promise.all([
    getTeamSize(gameId, nsoId),
    getMedalRows(gameId, nsoId),
  ]);
  // the layouts already check the ids, this is just in case
  if (!teamSize || !medalRows) notFound();

  return (
    <TeamJourneyClient
      gameId={gameId}
      nsoId={nsoId}
      saved={{ ...teamSize, medalRows }}
    />
  );
}
