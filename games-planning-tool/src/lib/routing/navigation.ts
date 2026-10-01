import type { Role } from '@/lib/types';

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

// NSO selector (COC/Admin) -> where to go after picking an NSO
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
    const section = pathname.split('/')[3]; // /game1/usa/calculator -> "calculator"
    return section === 'dashboard'
      ? `/${gameId}/dashboard?nso=${newNso}` // COC/Admin never see the NSO dashboard
      : `/${gameId}/${newNso}/${section}`;
  }
  return `${pathname}?nso=${newNso}`; // /game1/dashboard: same page, new ?nso=
}
