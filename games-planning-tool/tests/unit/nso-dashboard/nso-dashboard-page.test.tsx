// Made with AI agents (Antigravity)
import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import Page from '@/app/(application)/[gameId]/[nsoId]/dashboard/page';
import { TaskStatus } from '@/generated/prisma/enums';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
  prisma: {
    gameNso: { findUnique: vi.fn().mockResolvedValue(null) },
    task: { findMany: vi.fn().mockResolvedValue([]) },
    announcement: { findMany: vi.fn().mockResolvedValue([]) },
    resource: { findMany: vi.fn().mockResolvedValue([]) },
  },
}));

describe('NSO Dashboard Page', () => {
  it('counts every TaskStatus, shows required actions, and excludes complete tasks from deadlines', async () => {
    const deadline = new Date();
    deadline.setUTCDate(deadline.getUTCDate() + 1);
    const tasks = Object.values(TaskStatus).map((status) => ({
      id: status,
      gameNsoId: 'pair-1',
      stepKey: status,
      title: `Task ${status}`,
      description: null,
      status,
      deadline,
    }));
    vi.mocked(prisma.gameNso.findUnique).mockResolvedValueOnce({
      id: 'pair-1',
      gameId: 1,
      nsoId: '00000000-0000-0000-0000-000000000001',
    });
    vi.mocked(prisma.task.findMany).mockResolvedValueOnce(tasks);

    render(
      await Page({
        params: Promise.resolve({
          gameId: '1',
          nsoId: '00000000-0000-0000-0000-000000000001',
        }),
      }),
    );

    expect(
      screen.getByRole('heading', { name: /Planning Progress.*20% complete/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('img', {
        name: 'Planning status breakdown: Complete: 1, Submitted: 1, Action Required: 1, In Progress: 1, Not Started: 1',
      }),
    ).toBeInTheDocument();
    const actions = within(
      screen.getAllByRole('region', { name: 'Actions Required' }).at(-1)!,
    );
    expect(actions.getAllByRole('listitem')).toHaveLength(1);
    expect(actions.getByText('Task ACTION_REQUIRED')).toBeInTheDocument();
    const deadlines = within(
      screen.getAllByRole('region', { name: 'Deadlines Ahead' }).at(-1)!,
    );
    expect(deadlines.getAllByRole('listitem')).toHaveLength(4);
    expect(deadlines.queryByText('Task COMPLETE')).not.toBeInTheDocument();
  });

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
