'use server';
// TEMPORARY: backs the header's role toggle until real auth exists.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getActiveUsers } from '@/lib/queries/users';
import { getGamesWithNsos } from '@/lib/queries/games';
import { landingGame } from '@/lib/sessions';
import { DEV_USER_COOKIE, serializeDevCookie } from '@/lib/devSessionCookie';
import { gameSwitchHref } from '@/lib/routing/Navigation';
import type { Role } from '@/lib/types';

const ROLES: Role[] = ['admin', 'coc', 'nso'];

// View the app as the first active user with this role. Takes a role (not a
// user id) so the browser never needs other users' ids or names.
export async function switchRole(role: Role) {
  // Server Actions can be called with any input: only accept known roles.
  if (!ROLES.includes(role)) return;

  const [users, games] = await Promise.all([
    getActiveUsers(),
    getGamesWithNsos(),
  ]);
  const user = users.find((u) => u.role === role);
  if (!user) return;

  // Role/NSO ride along so proxy.ts can block routes without a DB call.
  const value = serializeDevCookie({
    id: user.id,
    role: user.role,
    nsoId: user.nsoId,
  });
  (await cookies()).set(DEV_USER_COOKIE, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });

  // Go straight to the user's landing page (not via '/', which sits outside the
  // app layout and would redirect a second time).
  const game = landingGame(user, games);
  redirect(game ? gameSwitchHref(String(game.id), user.role, user.nsoId) : '/');
}
