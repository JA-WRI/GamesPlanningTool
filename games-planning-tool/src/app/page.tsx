import { redirect } from 'next/navigation';
import { getSession, Games } from '@/lib/data';
import { landingPage } from '@/lib/routing/landing-page';

export default async function RootPage() {
  const session = await getSession();
  redirect(landingPage(session.user, Games[0].id));
}
