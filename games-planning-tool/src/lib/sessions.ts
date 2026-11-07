//no substantial AI generated code
import { connection } from 'next/server';
import { Role } from './types';
import { getGames } from '@/lib/queries/games';
import { getNsos } from '@/lib/queries/nsos';

export type Session = {
  user: {
    role: Role;
    gameId: number;
    nsoId?: string;
  };
};

export async function getSession(): Promise<Session | null> {
  // Sessions are per-request: never run this (or the DB queries below) at build time.
  // Real auth will read cookies(), which has the same effect.
  await connection();
  const [games, nsos] = await Promise.all([getGames(), getNsos()]);
  if (!games.length) return null; // nothing seeded yet

  return { user: { role: 'admin', gameId: games[0].id, nsoId: undefined } };
  // return { user: { role: 'coc', gameId: games[0].id, nsoId: undefined } };
  // return { user: { role: 'nso', gameId: games[0].id, nsoId: nsos[0]?.id } };
}
