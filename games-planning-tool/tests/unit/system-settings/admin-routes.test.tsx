//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

// notFound() and redirect() stop rendering by throwing; do the same here so
// the tests can check they were called.
const mocks = vi.hoisted(() => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
  redirect: vi.fn((url: string) => {
    throw new Error(`NEXT_REDIRECT ${url}`);
  }),
  getSession: vi.fn(),
  getGameById: vi.fn(),
  getSectionCompletion: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  notFound: mocks.notFound,
  redirect: mocks.redirect,
  useSelectedLayoutSegment: () => 'game-details',
}));
vi.mock('@/server/auth/session', () => ({ getSession: mocks.getSession }));
vi.mock('@/server/queries/games', () => ({
  getGameById: mocks.getGameById,
}));
vi.mock('@/server/queries/system-settings-completion', () => ({
  getSectionCompletion: mocks.getSectionCompletion,
}));

import AdminLayout from '@/app/(application)/admin/layout';
import GameSetupLayout from '@/app/(application)/admin/system-settings/[gameId]/layout';
import GameSetupPage from '@/app/(application)/admin/system-settings/[gameId]/page';
import { SETTINGS_SECTIONS } from '@/lib/system-settings-sections';

function sessionAs(role: 'admin' | 'coc' | 'nso') {
  mocks.getSession.mockResolvedValue({
    user: { id: 'u1', name: 'Test User', role },
  });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('Admin-only guard (/admin layout)', () => {
  it('shows admin pages to Admins', async () => {
    sessionAs('admin');
    render(await AdminLayout({ children: <p>Admin page</p> }));
    expect(screen.getByText('Admin page')).toBeInTheDocument();
    expect(mocks.notFound).not.toHaveBeenCalled();
  });

  it.each(['coc', 'nso'] as const)(
    'shows Not Found to %s users',
    async (role) => {
      sessionAs(role);
      await expect(
        AdminLayout({ children: <p>Admin page</p> }),
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(mocks.notFound).toHaveBeenCalledOnce();
    },
  );
});

describe('Game setup layout', () => {
  const params = (gameId: string) => Promise.resolve({ gameId });

  it('shows Not Found for a Game that does not exist', async () => {
    mocks.getGameById.mockResolvedValue(null);
    await expect(
      GameSetupLayout({ children: <p>Step</p>, params: params('99999') }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(mocks.getSectionCompletion).not.toHaveBeenCalled();
  });

  it('shows the Game name, the back link, the stepper and the current step', async () => {
    mocks.getGameById.mockResolvedValue({
      id: 8,
      name: 'Paris 2024',
    });
    mocks.getSectionCompletion.mockResolvedValue(
      Object.fromEntries(SETTINGS_SECTIONS.map((s) => [s.key, false])),
    );

    render(
      await GameSetupLayout({ children: <p>Step</p>, params: params('8') }),
    );

    expect(mocks.getGameById).toHaveBeenCalledWith('8');
    expect(mocks.getSectionCompletion).toHaveBeenCalledWith(8);
    expect(
      screen.getByRole('heading', { name: 'Paris 2024' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'All Games' })).toHaveAttribute(
      'href',
      '/admin/system-settings',
    );
    expect(
      screen.getByRole('navigation', { name: 'Game setup steps' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Step')).toBeInTheDocument();
  });
});

describe('Game setup page', () => {
  it('sends the Admin to the Details step', async () => {
    await expect(
      GameSetupPage({ params: Promise.resolve({ gameId: '8' }) }),
    ).rejects.toThrow('NEXT_REDIRECT /admin/system-settings/8/game-details');
  });
});
