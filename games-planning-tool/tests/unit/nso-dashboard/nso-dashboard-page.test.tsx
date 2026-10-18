// Made with AI agents (Antigravity)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/(application)/[gameId]/[nsoId]/dashboard/page';

describe('NSO Dashboard Page', () => {
  it('renders correctly', async () => {
    const page = await Page({
      params: Promise.resolve({
        gameId: 'game_id_1',
        nsoId: 'nso_1',
      }),
    });

    render(page);

    expect(
      screen.getByRole('heading', { name: 'NSO Dashboard', level: 1 }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Announcements', level: 2 }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Actions Required', level: 2 }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('heading', { name: 'Deadlines Ahead', level: 2 }),
    ).toBeInTheDocument();
  });
});
