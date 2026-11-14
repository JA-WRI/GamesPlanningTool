// @vitest-environment node
// AI contribution: 50% or more AI-generated
import { describe, it, expect, vi } from 'vitest';

// fake session, there is no real login yet
const { getSession } = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock('@/lib/data', () => ({ getSession }));

import { canEditNso } from '@/features/team-size/actions/canEditNso';

const NSO_ID = 'b9f0193f-2e62-4141-bffb-ffa3c7f9e9d7';

describe('canEditNso', () => {
  it('lets an NSO user edit only their own NSO', async () => {
    getSession.mockResolvedValue({
      user: { role: 'nso', gameId: '1', nsoId: NSO_ID },
    });

    expect(await canEditNso(NSO_ID)).toBe(true);
    expect(await canEditNso('another-nso')).toBe(false);
  });

  it('lets COC and admin edit any NSO', async () => {
    getSession.mockResolvedValue({ user: { role: 'coc', gameId: '1' } });
    expect(await canEditNso(NSO_ID)).toBe(true);

    getSession.mockResolvedValue({ user: { role: 'admin', gameId: '1' } });
    expect(await canEditNso(NSO_ID)).toBe(true);
  });

  it('refuses when there is no user', async () => {
    getSession.mockResolvedValue(null);

    expect(await canEditNso(NSO_ID)).toBe(false);
  });
});
