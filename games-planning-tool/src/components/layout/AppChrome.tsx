// Header + Navbar. Reads the session (cookies) and the DB, so the app layout
// renders it inside <Suspense>: the page shell and loading.tsx stream right away
// instead of a blank screen while this loads.
import { Suspense } from 'react';
import Header from './Header';
import Navbar from './Navbar';
import { getSession } from '@/lib/sessions';
import { getGamesWithNsos } from '@/lib/queries/games';
import { getActiveUsers } from '@/lib/queries/users';
import { canAccessGame } from '@/lib/routing/Navigation';

export default async function AppChrome() {
  //TODO: replace with real sessions later
  const session = await getSession();
  if (!session) return null; //TODO: prompt to login again

  const { user } = session;
  const [allGames, users] = await Promise.all([
    getGamesWithNsos(),
    getActiveUsers(),
  ]);

  // Only the games this user may see. NSO users also only get their own NSO,
  // so other NSOs' names/ids aren't sent to their browser.
  const games = allGames
    .filter((g) => canAccessGame(user, g))
    .map((g) =>
      user.role === 'nso'
        ? { ...g, nsos: g.nsos.filter((n) => n.id === user.nsoId) }
        : g,
    );

  // TEMPORARY (role toggle): which roles have a user to switch to.
  const availableRoles = [...new Set(users.map((u) => u.role))];

  return (
    <>
      <Header user={user} availableRoles={availableRoles} games={games} />
      <Suspense>
        <Navbar role={user.role} userNsoId={user.nsoId} games={games} />
      </Suspense>
    </>
  );
}
