import { forbidden } from 'next/navigation';
import { getSession } from '@/server/auth/session';

//replace with a forbidden.tsx for the app's Unauthorized page; until then, Next.js shows its default 403 page.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session.user.role !== 'admin') forbidden();

  return <>{children}</>;
}
