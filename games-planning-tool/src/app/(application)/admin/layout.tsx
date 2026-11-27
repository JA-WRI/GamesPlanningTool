import { notFound } from 'next/navigation';
import { getSession } from '@/server/auth/session';

// Admin-only guard for every /admin page. Non-Admins get the Not Found page for now. switch to the Unauthorized page later.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (session.user.role !== 'admin') notFound();

  return <>{children}</>;
}
