// Made with AI agents (Antigravity)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/(application)/[gameId]/[nsoId]/dashboard/page';

describe('NSO Dashboard Page', () => {
  it('renders correctly for NSO user', async () => {
    const jsx = await Page({
      params: Promise.resolve({ gameId: 'game_id_1', nsoId: 'nso_1' }),
    });
    render(jsx);

    expect(screen.getByText(/Here’s where your/)).toBeInTheDocument();
    expect(screen.getAllByText('Actions Required').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Deadlines Ahead').length).toBeGreaterThan(0);
    expect(screen.getByText('What’s New?')).toBeInTheDocument();
  });
});
