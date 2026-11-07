import { requireRole } from '@/lib/sessions';

// Admin pages are for Admin only.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('admin');
  return <>{children}</>;
}
