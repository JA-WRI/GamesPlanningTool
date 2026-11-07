import { requireRole } from '@/lib/sessions';

// Game-wide pages (e.g. the COC dashboard) are for COC and Admin only.
export default async function CocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRole('admin', 'coc');
  return <>{children}</>;
}
