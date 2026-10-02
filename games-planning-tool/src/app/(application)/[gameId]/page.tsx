import { redirect } from 'next/navigation';
import { getSession } from '@/lib/data';
import { gameSwitchHref } from '@/lib/routing/navigation';

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const session = await getSession();

  redirect(
    gameSwitchHref(session.user.gameId, session.user.role, session.user.nsoId),
  );
}
