import { redirect } from 'next/navigation';
import { getSession } from '@/lib/sessions';
import { gameSwitchHref } from '@/lib/routing/Navigation';

export default async function RootPage() {
  const session = await getSession();

  if (!session) {
    // No session, or no games seeded yet.
    // Once auth exists: redirect('/login');
    return <p className="p-4">No games available yet.</p>;
  }
  const { gameId, role, nsoId } = session.user;
  redirect(gameSwitchHref(String(gameId), role, nsoId));
}
