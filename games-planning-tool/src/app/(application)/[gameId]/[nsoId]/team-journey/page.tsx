// AI contribution: 50% or more AI-generated
import TeamJourneyClient from './_components/TeamJourneyClient';
import { getTeamSize } from '@/features/team-size/lib/teamSizeDb';

type TeamJourneyPageProps = {
  params: Promise<{ gameId: string; nsoId: string }>;
};

// server component, loads the saved team size, the tabs and form state live in TeamJourneyClient
export default async function TeamJourneyPage({
  params,
}: TeamJourneyPageProps) {
  const { gameId, nsoId } = await params;
  const saved = await getTeamSize(gameId, nsoId);

  return <TeamJourneyClient gameId={gameId} nsoId={nsoId} saved={saved} />;
}
