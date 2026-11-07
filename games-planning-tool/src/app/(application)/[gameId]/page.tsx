import { redirect } from 'next/navigation';
import { getSession } from '@/lib/sessions';
import { gameSwitchHref } from '@/lib/routing/Navigation';

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const [{ gameId }, session] = await Promise.all([params, getSession()]);
  if (!session) redirect('/');

  const { role, nsoId } = session.user;
  redirect(gameSwitchHref(gameId, role, nsoId));
}
