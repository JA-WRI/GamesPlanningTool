'use client';

import { Suspense } from 'react';
import { usePathname } from 'next/navigation';
import GamesSelector from './GamesSelector';
import NsoSelector from './NsoSelector';
import { isAdminPath } from '@/lib/routing/Navigation';
import type { GameWithNsos, Role } from '@/lib/types';

// The header's Game and NSO selectors, hidden on admin pages
export default function HeaderSelectors({
  role,
  games,
}: {
  role: Role;
  games: GameWithNsos[];
}) {
  const pathname = usePathname();
  if (isAdminPath(pathname)) return null;

  return (
    <div className="flex gap-8">
      <GamesSelector role={role} games={games} />
      {(role === 'coc' || role === 'admin') && (
        <Suspense>
          <NsoSelector games={games} />
        </Suspense>
      )}
    </div>
  );
}
