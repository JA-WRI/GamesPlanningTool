// Less than 50% AI generated to healp create fake sessions for temporary role toggle
// temporary: delete this file once real authentication is implemented
// (it becomes the auth provider's login/logout actions).
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { DEV_USER_COOKIE, listDevUsers } from './session';
import { getGamesWithNsos } from '@/server/queries/games';
import {
  gamesForUser,
  gameSwitchHref,
  resolveSessionNsoId,
} from '@/lib/routing/Navigation';

export async function switchDevUser(userId: string) {
  const [users, games] = await Promise.all([
    listDevUsers(),
    getGamesWithNsos(),
  ]);
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error('Unknown user.');

  (await cookies()).set(DEV_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  // The current URL may be off-limits for the new role (e.g. /admin as NSO),
  // so go straight to the new user's dashboard. Same logic as src/app/page.tsx,
  // copied here on purpose: redirecting to '/' leaves the (application) layout
  // for a frame, which causes a white flash.
  const game = gamesForUser(games, user.role, user.nsoId)[0];
  const nsoId = game && resolveSessionNsoId(game, user.role, user.nsoId);
  const canOpenGame = game && (user.role !== 'nso' || nsoId);

  redirect(
    canOpenGame ? gameSwitchHref(String(game.id), user.role, nsoId) : '/',
  );
}
