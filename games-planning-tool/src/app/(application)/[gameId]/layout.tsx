import { requireGameAccess } from '@/lib/sessions';

export default async function GameLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ gameId: string }>;
}) {
  const { gameId } = await params;
  // Game must exist; NSO users only see games their NSO takes part in.
  await requireGameAccess(gameId);

  return <>{children}</>;
}
