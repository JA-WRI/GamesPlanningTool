//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { usePathname } = vi.hoisted(() => ({
  usePathname: vi.fn<() => string>(),
}));
vi.mock('next/navigation', () => ({ usePathname }));

// The selectors themselves have their own tests; only whether they show matters here.
vi.mock('@/components/layout/GamesSelector', () => ({
  default: () => <div>Games selector</div>,
}));
vi.mock('@/components/layout/NsoSelector', () => ({
  default: () => <div>NSO selector</div>,
}));

import HeaderSelectors from '@/components/layout/HeaderSelectors';

const games = [{ id: 8, name: 'Paris 2024', nsos: [] }];

describe('HeaderSelectors', () => {
  beforeEach(() => {
    usePathname.mockReturnValue('/8/dashboard');
  });

  it.each([
    '/admin',
    '/admin/user-management',
    '/admin/system-settings/8/properties',
  ])('hides both selectors on the admin page %s', (path) => {
    usePathname.mockReturnValue(path);
    render(<HeaderSelectors role="admin" games={games} />);
    expect(screen.queryByText('Games selector')).not.toBeInTheDocument();
    expect(screen.queryByText('NSO selector')).not.toBeInTheDocument();
  });

  it.each(['admin', 'coc'] as const)(
    'shows the Games and NSO selectors to %s users on Game pages',
    (role) => {
      render(<HeaderSelectors role={role} games={games} />);
      expect(screen.getByText('Games selector')).toBeInTheDocument();
      expect(screen.getByText('NSO selector')).toBeInTheDocument();
    },
  );

  it('shows only the Games selector to NSO users', () => {
    render(<HeaderSelectors role="nso" games={games} />);
    expect(screen.getByText('Games selector')).toBeInTheDocument();
    expect(screen.queryByText('NSO selector')).not.toBeInTheDocument();
  });
});
