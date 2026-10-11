// Made with AI agents (Antigravity)
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Page from '@/app/(application)/[gameId]/[nsoId]/dashboard/page';

describe('NSO Dashboard Page', () => {
  it('renders correctly with resource row', async () => {
    const jsx = await Page({
      params: Promise.resolve({ gameId: 'game_id_1', nsoId: 'nso_1' }),
    });
    render(jsx);

    expect(screen.getByText('nso page')).toBeInTheDocument();
    expect(screen.getByText('Resources')).toBeInTheDocument();
  });
});
