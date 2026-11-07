import { getSession } from '@/lib/sessions';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import { Suspense } from 'react';
import { getGamesWithNsos } from '@/lib/queries/games';
import { gameHasNso } from '@/lib/routing/Navigation';

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //TODO: replace with real sessions later
  const session = await getSession();
  if (!session) return null; //TODO: prompt to login again

  const { role, nsoId } = session.user;
  const allGames = await getGamesWithNsos();
  // NSO users only see the games their NSO participates in.
  const games =
    role === 'nso' ? allGames.filter((g) => gameHasNso(g, nsoId)) : allGames;

  return (
    <>
      <Header role={role} games={games} />
      <Suspense>
        <Navbar role={role} userNsoId={nsoId} games={games} />
      </Suspense>
      <main className="page-container p-4">{children}</main>
    </>
  );
}
