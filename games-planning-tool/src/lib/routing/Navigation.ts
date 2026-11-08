//Less than 50% AI generated Code to create resolveSessionNsoId functiion
import type { Game, GameWithNsos, Role } from '@/lib/types';

type Ctx = {
  role: Role;
  game: string;
  nso: string;
  picked?: string | null; // NSO chosen via URL, COC/Admin only
};

export function tabRoute(path: string, { role, game, nso, picked }: Ctx) {
  let route: string;

  if (path.startsWith('/')) {
    route = path; // admin pages
  } else if (path === 'dashboard') {
    route = role === 'nso' ? `/${game}/${nso}/dashboard` : `/${game}/dashboard`;
  } else if (path === 'resources') {
    route =
      role === 'admin'
        ? `/admin/resource-management`
        : `/${game}/${nso}/resources`;
  } else {
    route = `/${game}/${nso}/${path}`;
  }

  // Only the COC/Admin dashboard carries ?nso=
  const href =
    path === 'dashboard' && role !== 'nso' && picked
      ? `${route}?nso=${picked}`
      : route;

  return { route, href };
}

export function isActive(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export function gameSwitchHref(newGame: string, role: Role, nsoId?: string) {
  return role === 'nso' && nsoId
    ? `/${newGame}/${nsoId}/dashboard`
    : `/${newGame}/dashboard`;
}

// NSO selector for COC/Admin
export function nsoSwitchHref({
  pathname,
  gameId,
  nsoId,
  newNso,
}: {
  pathname: string;
  gameId: string;
  nsoId?: string;
  newNso: string;
}) {
  if (nsoId) {
    const section = pathname.split('/')[3];
    return section === 'dashboard'
      ? `/${gameId}/dashboard?nso=${newNso}` //if on the dashboard, stay on the dashboard for chosen game
      : `/${gameId}/${newNso}/${section}`; //if on an NSO page, stay on the same section, but for the chosen NSO
  }
  return `${pathname}?nso=${newNso}`;
}

// picks which NSO to put in the redirect URL when someone opens / or /[gameId]
// COC/admin: returns undefined, since their dashboard URL has no nsoId.
// NSO: returns the session's nsoId if that NSO is in this game. If not,
//   returns the game's first NSO, so the redirect never goes to a URL that
//   404s. Returns undefined if the game has no NSOs.
// TODO: remove the fallback once sessions come from the database. The mock
// session's nsoId ('nso_1') doesn't exist in the real data, but a real NSO
// user's NSO will always be in their game.
export function resolveSessionNsoId(
  game: GameWithNsos,
  role: Role,
  sessionNsoId?: string,
): string | undefined {
  if (role !== 'nso') return undefined;
  const match = game.nsos.find((n) => n.id === sessionNsoId);
  return match?.id ?? game.nsos[0]?.id;
}

// Finds the game whose id matches a URL param. Game ids are numbers in the
// database but strings in the URL, so the conversion happens here only.
export function findGame<T extends Game>(
  games: T[],
  gameId: string | undefined,
): T | undefined {
  if (!gameId) return undefined;
  return games.find((g) => String(g.id) === gameId);
}
