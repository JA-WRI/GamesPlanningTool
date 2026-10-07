import { getSession } from '@/lib/data';
import Header from '@/components/layout/Header';
import Navbar from '@/components/layout/Navbar';
import { Suspense } from 'react';

export default async function ApplicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //TODO: replace with real sessions later
  const session = await getSession();
  if (!session) return null; //TODO: prompt to login again

  return (
    <>
      <Header role={session.user.role} />
      <Suspense>
        <Navbar role={session.user.role} />
      </Suspense>
      <main className="page-container p-4">{children}</main>
    </>
  );
}
