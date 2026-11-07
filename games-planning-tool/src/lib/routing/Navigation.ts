//no substantial AI-generated code
import type { AppUser, GameWithNsos, Role } from '@/lib/types';

type Ctx = {
  role: Role;
  game?: string; // undefined when no games exist
  nso?: string; // undefined when the game has no NSOs
  picked?: string | null; // NSO chosen via URL, COC/Admin only
};

// Route params are strings; game ids are numbers.
export function findGame(games: GameWithNsos[], gameId?: string | null) {
  return gameId ? games.find((g) => String(g.id) === gameId) : undefined;
}

export function gameHasNso(
  game: GameWithNsos | undefined,
  nsoId?: string | null,
) {
  return !!nsoId && !!game?.nsos.some((n) => n.id === nsoId);
}

// --- Permission rules (pure; enforced server-side by the require* helpers in sessions.ts) ---
type Viewer = Pick<AppUser, 'role' | 'nsoId'>;

// The game exists, and NSO users can only see games their NSO takes part in.
export function canAccessGame(user: Viewer, game: GameWithNsos | undefined) {
  if (!game) return false;
  return user.role !== 'nso' || gameHasNso(game, user.nsoId);
}

// The NSO takes part in the game, and NSO users can only see their own NSO.
export function canAccessNso(
  user: Viewer,
  game: GameWithNsos | undefined,
  nsoId: string,
) {
  if (!canAccessGame(user, game) || !gameHasNso(game, nsoId)) return false;
  return user.role !== 'nso' || user.nsoId === nsoId;
}

// Route-level role rule, used by proxy.ts BEFORE anything renders (layout
// checks alone can't stop a page's content from being sent). Path only, no DB:
// whether the game/NSO exist is still checked by the route layouts.
export function isRouteAllowed(pathname: string, user: Viewer) {
  const [first, second] = pathname.split('/').filter(Boolean);
  if (first === 'admin') return user.role === 'admin';
  if (!first || !second) return true; // '/', '/login', '/{game}'
  if (second === 'dashboard') return user.role !== 'nso'; // COC/Admin game dashboard
  // '/{game}/{nso}/...': NSO users only their own NSO
  return user.role !== 'nso' || second === user.nsoId;
}

// Returns null when the tab needs a game/NSO but none is available.
export function tabRoute(
  path: string,
  { role, game, nso, picked }: Ctx,
): { route: string; href: string } | null {
  let route: string;

  if (path.startsWith('/')) {
    route = path; // admin pages
  } else if (path === 'resources' && role === 'admin') {
    route = `/admin/resource-management`;
  } else if (!game) {
    return null;
  } else if (path === 'dashboard' && role !== 'nso') {
    route = `/${game}/dashboard`;
  } else if (!nso) {
    return null;
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

// nsoId: the NSO user's own NSO. pickedNso: COC/Admin's current selection,
// only kept if it participates in the new game (caller checks).
export function gameSwitchHref(
  newGame: string,
  role: Role,
  nsoId?: string,
  pickedNso?: string,
) {
  if (role === 'nso') {
    return nsoId ? `/${newGame}/${nsoId}/dashboard` : `/${newGame}/dashboard`;
  }
  return pickedNso
    ? `/${newGame}/dashboard?nso=${pickedNso}`
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
