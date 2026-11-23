//  More than 50% AI Generated Code
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

// Child components have their own tests; this checks what Header passes them.
const { HeaderSelectors } = vi.hoisted(() => ({
  HeaderSelectors: vi.fn(() => <div>Selectors</div>),
}));
vi.mock('@/components/layout/HeaderSelectors', () => ({
  default: HeaderSelectors,
}));
vi.mock('@/components/layout/DevUserToggle', () => ({
  default: () => null,
}));

import Header from '@/components/layout/Header';

const games = [{ id: 8, name: 'Paris 2024', nsos: [] }];

describe('Header', () => {
  it("shows the user's name, role and initials", () => {
    render(
      <Header
        user={{ id: 'u1', name: 'Jamie Lee', role: 'coc' }}
        games={games}
        devUsers={[]}
      />,
    );
    expect(screen.getByText('Jamie Lee')).toBeInTheDocument();
    expect(screen.getByText('COC')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'JL' })).toBeInTheDocument();
  });

  it("passes the user's role and games to the header selectors", () => {
    render(
      <Header
        user={{ id: 'u1', name: 'Sam Admin', role: 'admin' }}
        games={games}
        devUsers={[]}
      />,
    );
    expect(screen.getByText('Selectors')).toBeInTheDocument();
    expect(HeaderSelectors).toHaveBeenCalledWith(
      { role: 'admin', games },
      undefined,
    );
  });
});
