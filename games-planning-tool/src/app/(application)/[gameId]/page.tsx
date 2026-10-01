import { redirect } from 'next/navigation';
import { getSession } from '@/lib/data';
import { landingPage } from '@/lib/routing/landing-page';

export default async function GamePage({
  params,
}: {
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  const session = await getSession();

  redirect(landingPage(session.user, gameId));
}
