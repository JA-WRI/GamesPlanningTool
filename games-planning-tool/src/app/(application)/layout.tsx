import { getSession } from '@/lib/data';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import { Suspense } from 'react';
import { getGamesWithNsos } from '@/server/queries/games';
import { gamesForUser } from '@/lib/routing/Navigation';
import DraftNavigationGuard from '@/components/commons/DraftNavigationGuard';

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //TODO: replace with real sessions later
  const session = await getSession();
  if (!session) return null; //TODO: prompt to login again

  // NSO users only see the games their NSO is in. Filtered on the server so
  // the other games never reach the client.
  const { role, nsoId } = session.user;
  const games = gamesForUser(await getGamesWithNsos(), role, nsoId);

  return (
    <>
      <DraftNavigationGuard />
      <Header role={role} games={games} />
      <Suspense>
        <Navbar role={role} userNsoId={nsoId} games={games} />
      </Suspense>
      <main className="page-container p-4">{children}</main>
    </>
  );
}
