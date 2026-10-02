import { redirect } from 'next/navigation';
import { getSession, Games } from '@/lib/data';
import { gameSwitchHref } from '@/lib/routing/navigation';

export default async function RootPage() {
  const session = await getSession();
  redirect(
    gameSwitchHref(session.user.gameId, session.user.role, session.user.nsoId),
  );
}
