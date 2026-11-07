// Header + Navbar. Reads the session (cookies) and the DB, so the app layout
// renders it inside <Suspense>; that lets the page shell and loading.tsx (avoids white screen flash)
import { Suspense } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import { getSession } from '@/lib/sessions';
import { getGamesWithNsos } from '@/lib/queries/games';
import { getActiveUsers } from '@/lib/queries/users';

export default async function AppChrome() {
  //TODO: replace with real sessions later
  const session = await getSession();
  if (!session) return null; //TODO: prompt to login again

  const { role, nsoId } = session.user;
  const [allGames, users] = await Promise.all([
    getGamesWithNsos(),
    getActiveUsers(),
  ]);
  // NSO users only see the games their NSO participates in.
  const games =
    role === 'nso'
      ? allGames.filter((g) => g.nsos.some((n) => n.id === nsoId))
      : allGames;

  return (
    <>
      <Header user={session.user} users={users} games={games} />
      <Suspense>
        <Navbar role={role} userNsoId={nsoId} games={games} />
      </Suspense>
    </>
  );
}
