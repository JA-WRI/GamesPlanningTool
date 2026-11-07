import { requireNsoAccess } from '@/lib/sessions';

export default async function NsoLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string; nsoId: string }>;
}) {
  const { gameId, nsoId } = await params;
  // NSO must be in this game; NSO users can only view their own NSO.
  await requireNsoAccess(gameId, nsoId);

  return <>{children}</>;
}
