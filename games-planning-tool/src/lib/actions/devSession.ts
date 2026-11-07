'use server';
// TEMPORARY: backs the header's role toggle until real auth exists.
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getActiveUsers } from '@/lib/queries/users';
import { getGamesWithNsos } from '@/lib/queries/games';
import { DEV_USER_COOKIE, landingGame } from '@/lib/sessions';
import { gameSwitchHref } from '@/lib/routing/Navigation';

export async function switchUser(userId: string) {
  const [users, games] = await Promise.all([
    getActiveUsers(),
    getGamesWithNsos(),
  ]);
  const user = users.find((u) => u.id === userId);
  if (!user) return;

  (await cookies()).set(DEV_USER_COOKIE, userId, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  });

  // Go straight to the user's landing page (not via '/', which sits outside the
  // app layout and would redirect a second time).
  const game = landingGame(user, games);
  redirect(game ? gameSwitchHref(String(game.id), user.role, user.nsoId) : '/');
}
