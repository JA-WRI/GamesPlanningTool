//Less than 50% AI generated to fix sessions to work with devSessions (temporary until auth is implemented)
// TEMPORARY dev session: the "logged in" user is whichever DB user is picked with
// the header's role toggle (stored in a cookie). Replace with real auth later.
// While this is in place anyone can act as any user (incl. admin): prototype
// only, do not deploy publicly.
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import type { AppUser, GameWithNsos, Role } from './types';
import { getGamesWithNsos } from '@/lib/queries/games';
import { getActiveUsers } from '@/lib/queries/users';
import { DEV_USER_COOKIE, parseDevCookie } from '@/lib/devSessionCookie';
import {
  canAccessGame,
  canAccessNso,
  findGame,
} from '@/lib/routing/Navigation';

export type Session = {
  user: AppUser & {
    gameId: number; // the game to land on
  };
};

// The game a user lands on: the first game they may access.
export function landingGame(user: AppUser, games: GameWithNsos[]) {
  return games.find((g) => canAccessGame(user, g));
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
  const pickedId = parseDevCookie(cookieStore.get(DEV_USER_COOKIE)?.value)?.id;
  const user =
    users.find((u) => u.id === pickedId) ??
    users.find((u) => u.role === 'admin') ??
    users[0];
  if (!user) return null; // no users seeded yet

  const game = landingGame(user, games);
  if (!game) return null; // no (matching) games seeded yet

  return { user: { ...user, gameId: game.id } };
});

// --- Access checks (Data Access Layer) ---
// Layouts call these, but layouts don't re-run on every navigation and Server
// Actions bypass them entirely. So also call the matching helper in any page,
// data function or Server Action that reads or changes game/NSO data.

// No session: back to the root page.
export async function requireSession(): Promise<Session> {
  const session = await getSession();
  if (!session) redirect('/');
  return session;
}

// e.g. requireRole('admin') for admin pages.
export async function requireRole(...roles: Role[]): Promise<Session> {
  const session = await requireSession();
  if (!roles.includes(session.user.role)) notFound();
  return session;
}

// The game exists and the user may see it (NSO users: only their NSO's games).
export async function requireGameAccess(gameId: string): Promise<Session> {
  const session = await requireSession();
  const game = findGame(await getGamesWithNsos(), gameId);
  if (!canAccessGame(session.user, game)) notFound();
  return session;
}

// The NSO is in the game and the user may see it (NSO users: only their own).
export async function requireNsoAccess(
  gameId: string,
  nsoId: string,
): Promise<Session> {
  const session = await requireSession();
  const game = findGame(await getGamesWithNsos(), gameId);
  if (!canAccessNso(session.user, game, nsoId)) notFound();
  return session;
}
