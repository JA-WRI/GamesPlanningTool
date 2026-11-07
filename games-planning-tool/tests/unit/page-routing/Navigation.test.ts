//100% AI generated: Test cases were made with AI to test the correct navigation structure
import {
  tabRoute,
  isActive,
  gameSwitchHref,
  nsoSwitchHref,
  findGame,
  gameHasNso,
  canAccessGame,
  canAccessNso,
  isRouteAllowed,
} from '@/lib/routing/Navigation';
import { describe, it, expect } from 'vitest';
import { parseDevCookie, serializeDevCookie } from '@/lib/devSessionCookie';

const base = { game: 'game1', nso: 'usa' };

describe('tabRoute', () => {
  it('NSO dashboard includes their NSO', () => {
    expect(tabRoute('dashboard', { ...base, role: 'nso' })!.href).toBe(
      '/game1/usa/dashboard',
    );
  });
  it('COC dashboard is the game overview', () => {
    expect(tabRoute('dashboard', { ...base, role: 'coc' })!.href).toBe(
      '/game1/dashboard',
    );
  });
  it('COC dashboard keeps the picked NSO in href but not in route', () => {
    const r = tabRoute('dashboard', { ...base, role: 'admin', picked: 'can' })!;
    expect(r.href).toBe('/game1/dashboard?nso=can');
    expect(r.route).toBe('/game1/dashboard');
  });
  it('NSO role never gets ?nso=', () => {
    expect(
      tabRoute('dashboard', { ...base, role: 'nso', picked: 'can' })!.href,
    ).toBe('/game1/usa/dashboard');
  });
  it('admin paths are used as-is', () => {
    expect(
      tabRoute('/admin/user-management', { ...base, role: 'admin' })!.href,
    ).toBe('/admin/user-management');
  });
  it('resources tab routes to editable management for COC/Admin and view-only for NSO', () => {
    expect(tabRoute('resources', { ...base, role: 'nso' })!.href).toBe(
      '/game1/usa/resources',
    );
    expect(tabRoute('resources', { ...base, role: 'coc' })!.href).toBe(
      '/game1/usa/resources',
    );
    expect(tabRoute('resources', { ...base, role: 'admin' })!.href).toBe(
      '/admin/resource-management',
    );
  });
  it('other tabs live under the NSO', () => {
    for (const p of ['calculator', 'team-journey', 'contact-information']) {
      expect(tabRoute(p, { ...base, role: 'coc' })!.href).toBe(
        `/game1/usa/${p}`,
      );
    }
  });
  it('returns null for NSO tabs when there is no NSO', () => {
    expect(tabRoute('calculator', { game: 'game1', role: 'coc' })).toBeNull();
    expect(tabRoute('dashboard', { game: 'game1', role: 'nso' })).toBeNull();
    expect(tabRoute('dashboard', { game: 'game1', role: 'coc' })!.href).toBe(
      '/game1/dashboard',
    );
  });
  it('returns null for game tabs when there is no game, but keeps admin pages', () => {
    expect(tabRoute('dashboard', { role: 'admin' })).toBeNull();
    expect(tabRoute('resources', { role: 'admin' })!.href).toBe(
      '/admin/resource-management',
    );
  });
  it('never produces "undefined"', () => {
    for (const p of ['dashboard', 'calculator', 'resources']) {
      expect(tabRoute(p, { ...base, role: 'coc' })!.href).not.toContain(
        'undefined',
      );
    }
  });
});

describe('isActive', () => {
  it('matches exact and nested paths', () => {
    expect(isActive('/game1/usa/calculator', '/game1/usa/calculator')).toBe(
      true,
    );
    expect(isActive('/game1/usa/calculator/x', '/game1/usa/calculator')).toBe(
      true,
    );
  });
  it('does not match a sibling with a shared prefix', () => {
    expect(isActive('/game1/usa/calculators', '/game1/usa/calculator')).toBe(
      false,
    );
  });
});

describe('gameSwitchHref', () => {
  it('NSO goes to their own dashboard in the new game', () => {
    expect(gameSwitchHref('game2', 'nso', 'usa')).toBe('/game2/usa/dashboard');
  });
  it('COC goes to the game overview', () => {
    expect(gameSwitchHref('game2', 'coc')).toBe('/game2/dashboard');
  });
  it('Admin goes to the game overview', () => {
    expect(gameSwitchHref('game2', 'admin', 'usa')).toBe('/game2/dashboard');
  });
  it('NSO without an nsoId falls back to the game overview', () => {
    expect(gameSwitchHref('game2', 'nso')).toBe('/game2/dashboard');
  });
  it('COC/Admin keep a picked NSO that is valid for the new game', () => {
    expect(gameSwitchHref('game2', 'coc', undefined, 'can')).toBe(
      '/game2/dashboard?nso=can',
    );
  });
  it('NSO role ignores pickedNso', () => {
    expect(gameSwitchHref('game2', 'nso', 'usa', 'can')).toBe(
      '/game2/usa/dashboard',
    );
  });
});

describe('findGame / gameHasNso', () => {
  const games = [
    { id: 1, name: 'LA 2028', nsos: [{ id: 'usa', name: 'USA' }] },
    { id: 2, name: 'Milan 2026', nsos: [] },
  ];
  it('matches numeric ids against string params', () => {
    expect(findGame(games, '1')?.name).toBe('LA 2028');
    expect(findGame(games, '1.0')).toBeUndefined();
    expect(findGame(games, undefined)).toBeUndefined();
  });
  it('checks NSO participation', () => {
    expect(gameHasNso(findGame(games, '1'), 'usa')).toBe(true);
    expect(gameHasNso(findGame(games, '2'), 'usa')).toBe(false);
    expect(gameHasNso(undefined, 'usa')).toBe(false);
    expect(gameHasNso(findGame(games, '1'), null)).toBe(false);
  });
});

describe('nsoSwitchHref', () => {
  const base = { gameId: 'game1', newNso: 'can' };

  it('keeps the page when on an NSO page', () => {
    expect(
      nsoSwitchHref({
        ...base,
        pathname: '/game1/usa/calculator',
        nsoId: 'usa',
      }),
    ).toBe('/game1/can/calculator');
    expect(
      nsoSwitchHref({
        ...base,
        pathname: '/game1/usa/team-journey',
        nsoId: 'usa',
      }),
    ).toBe('/game1/can/team-journey');
    expect(
      nsoSwitchHref({
        ...base,
        pathname: '/game1/usa/resources',
        nsoId: 'usa',
      }),
    ).toBe('/game1/can/resources');
  });

  it('NSO dashboard becomes the game dashboard with ?nso=', () => {
    expect(
      nsoSwitchHref({
        ...base,
        pathname: '/game1/usa/dashboard',
        nsoId: 'usa',
      }),
    ).toBe('/game1/dashboard?nso=can');
  });

  it('game dashboard stays put and sets ?nso=', () => {
    expect(nsoSwitchHref({ ...base, pathname: '/game1/dashboard' })).toBe(
      '/game1/dashboard?nso=can',
    );
  });

  it('never produces "undefined"', () => {
    const result = nsoSwitchHref({ ...base, pathname: '/game1/dashboard' });
    expect(result).not.toContain('undefined');
  });
});

describe('canAccessGame / canAccessNso', () => {
  const games = [
    {
      id: 1,
      name: 'LA 2028',
      nsos: [
        { id: 'swim', name: 'Swimming' },
        { id: 'track', name: 'Athletics' },
      ],
    },
    { id: 2, name: 'Milan 2026', nsos: [{ id: 'ski', name: 'Skiing' }] },
  ];
  const la = games[0];
  const milan = games[1];
  const admin = { role: 'admin' as const };
  const coc = { role: 'coc' as const };
  const swimmer = { role: 'nso' as const, nsoId: 'swim' };

  it('admin and coc can access any existing game', () => {
    for (const user of [admin, coc]) {
      expect(canAccessGame(user, la)).toBe(true);
      expect(canAccessGame(user, milan)).toBe(true);
      expect(canAccessGame(user, undefined)).toBe(false);
    }
  });
  it('NSO users only access games their NSO is in', () => {
    expect(canAccessGame(swimmer, la)).toBe(true);
    expect(canAccessGame(swimmer, milan)).toBe(false);
    expect(canAccessGame({ role: 'nso' }, la)).toBe(false);
  });
  it('admin and coc can access any NSO that is in the game', () => {
    for (const user of [admin, coc]) {
      expect(canAccessNso(user, la, 'swim')).toBe(true);
      expect(canAccessNso(user, la, 'track')).toBe(true);
      expect(canAccessNso(user, la, 'ski')).toBe(false);
      expect(canAccessNso(user, undefined, 'swim')).toBe(false);
    }
  });
  it('NSO users only access their own NSO', () => {
    expect(canAccessNso(swimmer, la, 'swim')).toBe(true);
    expect(canAccessNso(swimmer, la, 'track')).toBe(false);
    expect(canAccessNso(swimmer, milan, 'ski')).toBe(false);
  });
});

describe('isRouteAllowed', () => {
  const admin = { role: 'admin' as const };
  const coc = { role: 'coc' as const };
  const swimmer = { role: 'nso' as const, nsoId: 'swim' };

  it('admin pages are admin only', () => {
    expect(isRouteAllowed('/admin/user-management', admin)).toBe(true);
    expect(isRouteAllowed('/admin', coc)).toBe(false);
    expect(isRouteAllowed('/admin/system-settings', swimmer)).toBe(false);
  });
  it('the game dashboard is for COC/Admin only', () => {
    expect(isRouteAllowed('/1/dashboard', admin)).toBe(true);
    expect(isRouteAllowed('/1/dashboard', coc)).toBe(true);
    expect(isRouteAllowed('/1/dashboard', swimmer)).toBe(false);
  });
  it('NSO users only reach their own NSO pages', () => {
    expect(isRouteAllowed('/1/swim/calculator', swimmer)).toBe(true);
    expect(isRouteAllowed('/1/track/calculator', swimmer)).toBe(false);
    expect(isRouteAllowed('/1/track/calculator', coc)).toBe(true);
  });
  it('root, login and game index pages are always allowed', () => {
    for (const p of ['/', '/login', '/1']) {
      expect(isRouteAllowed(p, swimmer)).toBe(true);
    }
  });
});

describe('dev session cookie', () => {
  it('round-trips id, role and NSO', () => {
    const c = { id: 'u1', role: 'nso' as const, nsoId: 'swim' };
    expect(parseDevCookie(serializeDevCookie(c))).toEqual(c);
    expect(
      parseDevCookie(serializeDevCookie({ id: 'u2', role: 'coc' })),
    ).toEqual({ id: 'u2', role: 'coc', nsoId: undefined });
  });
  it('rejects missing or malformed values', () => {
    expect(parseDevCookie(undefined)).toBeUndefined();
    expect(parseDevCookie('just-an-id')).toBeUndefined();
    expect(parseDevCookie('u1|superuser|')).toBeUndefined();
  });
});
