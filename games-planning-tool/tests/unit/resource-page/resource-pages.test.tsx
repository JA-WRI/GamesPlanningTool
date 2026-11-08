// 50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ResourcesPage from '@/app/(application)/[gameId]/[nsoId]/resources/page';
import ResourceManagementPage from '@/app/(application)/admin/resource-management/page';

vi.mock('@/lib/resources', () => ({
  listResources: vi.fn().mockResolvedValue([]),
  resourceVisibilityFor: vi.fn().mockReturnValue({
    gameCategory: 'Summer Games',
    nsoCategory: 'Badminton',
  }),
}));

describe('Resource Page Wrappers', () => {
  it('renders NSO ResourcesPage', async () => {
    render(
      await ResourcesPage({
        params: Promise.resolve({ gameId: 'game_id_1', nsoId: 'nso_1' }),
      }),
    );
    expect(screen.getByText('Resources Dashboard')).toBeInTheDocument();
  });

  it('renders Admin ResourceManagementPage', async () => {
    render(await ResourceManagementPage());
    expect(screen.getByText('Resources Dashboard')).toBeInTheDocument();
  });
});
