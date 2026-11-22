import { redirect } from 'next/navigation';

// Opening a Game lands on its first section.
export default async function GameSetupPage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  redirect(`/admin/system-settings/${gameId}/game-details`);
}
