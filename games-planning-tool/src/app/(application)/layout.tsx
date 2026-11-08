import { getSession } from '@/lib/data';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import { Suspense } from 'react';
import { getGamesWithNsos } from '@/server/queries/games';

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //TODO: replace with real sessions later
  const session = await getSession();
  if (!session) return null; //TODO: prompt to login again

  const games = await getGamesWithNsos();

  return (
    <>
      <Header role={session.user.role} games={games} />
      <Suspense>
        <Navbar role={session.user.role} games={games} />
      </Suspense>
      <main className="page-container p-4">{children}</main>
    </>
  );
}
