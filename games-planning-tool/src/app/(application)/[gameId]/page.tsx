import { redirect } from 'next/navigation';
import { getSession } from '@/lib/data';
import { gameSwitchHref } from '@/lib/routing/Navigation';

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const [session, { gameId }] = await Promise.all([getSession(), params]);

  // gameId has already been validated by the [gameId] layout
  redirect(gameSwitchHref(gameId, session.user.role, session.user.nsoId));
}
