//Less than 50% AI generated to fix sessions to work with devSessions (temporary until auth is implemented)
// TEMPORARY dev session: the "logged in" user is whichever DB user is picked in
// the header's user switcher (stored in a cookie). Replace with real auth later.
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import type { AppUser, GameWithNsos } from './types';
import { getGamesWithNsos } from '@/lib/queries/games';
import { getActiveUsers } from '@/lib/queries/users';

export const DEV_USER_COOKIE = 'dev-user-id';

export type Session = {
  user: AppUser & {
    gameId: number; // the game to land on
  };
};

// The game a user lands on: NSO users get the first game their NSO is part of.
export function landingGame(user: AppUser, games: GameWithNsos[]) {
  return user.role === 'nso'
    ? games.find((g) => g.nsos.some((n) => n.id === user.nsoId))
    : games[0];
}

// cache(): the layout, pages and header all call this once per request.
export const getSession = cache(async (): Promise<Session | null> => {
  // cookies() is request-time, so this (and the DB queries) never run at build time.
  const cookieStore = await cookies();
  const [users, games] = await Promise.all([
    getActiveUsers(),
    getGamesWithNsos(),
  ]);

  // Picked user, falling back to the first admin, then the first user.
  const pickedId = cookieStore.get(DEV_USER_COOKIE)?.value;
  const user =
    users.find((u) => u.id === pickedId) ??
    users.find((u) => u.role === 'admin') ??
    users[0];
  if (!user) return null; // no users seeded yet

  const game = landingGame(user, games);
  if (!game) return null; // no (matching) games seeded yet

  return { user: { ...user, gameId: game.id } };
});
