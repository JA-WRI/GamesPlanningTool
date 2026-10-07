//100% AI generated: Test cases were made with AI to test the correct navigation structure
import {
  tabRoute,
  isActive,
  gameSwitchHref,
  nsoSwitchHref,
} from '@/lib/routing/Navigation';
import { describe, it, expect } from 'vitest';

const base = { game: 'game1', nso: 'usa' };

describe('tabRoute', () => {
  it('NSO dashboard includes their NSO', () => {
    expect(tabRoute('dashboard', { ...base, role: 'nso' }).href).toBe(
      '/game1/usa/dashboard',
    );
  });
  it('COC dashboard is the game overview', () => {
    expect(tabRoute('dashboard', { ...base, role: 'coc' }).href).toBe(
      '/game1/dashboard',
    );
  });
  it('COC dashboard keeps the picked NSO in href but not in route', () => {
    const r = tabRoute('dashboard', { ...base, role: 'admin', picked: 'can' });
    expect(r.href).toBe('/game1/dashboard?nso=can');
    expect(r.route).toBe('/game1/dashboard');
  });
  it('NSO role never gets ?nso=', () => {
    expect(
      tabRoute('dashboard', { ...base, role: 'nso', picked: 'can' }).href,
    ).toBe('/game1/usa/dashboard');
  });
  it('admin paths are used as-is', () => {
    expect(
      tabRoute('/admin/user-management', { ...base, role: 'admin' }).href,
    ).toBe('/admin/user-management');
  });
  it('other tabs live under the NSO', () => {
    for (const p of [
      'calculator',
      'team-journey',
      'resources',
      'contact-information',
    ]) {
      expect(tabRoute(p, { ...base, role: 'coc' }).href).toBe(
        `/game1/usa/${p}`,
      );
    }
  });
  it('never produces "undefined"', () => {
    for (const p of ['dashboard', 'calculator', 'resources']) {
      expect(tabRoute(p, { ...base, role: 'coc' }).href).not.toContain(
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
