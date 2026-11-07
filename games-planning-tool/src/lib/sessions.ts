// TEMPORARY session until auth / the role toggle exist: change the role below
// to view the app as Admin, COC or NSO. Game and NSO come from the database.
import 'server-only';
import { cache } from 'react';
import { connection } from 'next/server';
import { getGamesWithNsos } from '@/lib/queries/games';
import type { Role } from '@/lib/types';

// Change to 'coc' or 'nso' to view the app as that role.
const ROLE = 'admin' as Role;

export type Session = {
  user: {
    role: Role;
    gameId: number; // the game to land on
    nsoId?: string; // only for NSO users
  };
};

// cache(): the layout and pages share one lookup per request.
export const getSession = cache(async (): Promise<Session | null> => {
  // Request-time only, so the DB is never queried during `next build`.
  await connection();
  const games = await getGamesWithNsos();
  const game = games[0];
  if (!game) return null; // nothing seeded yet

  return ROLE === 'nso'
    ? { user: { role: 'nso', gameId: game.id, nsoId: game.nsos[0]?.id } }
    : { user: { role: ROLE, gameId: game.id } };
});
