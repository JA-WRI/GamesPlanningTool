// @vitest-environment node
// AI usage -> 100%
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getSession = vi.hoisted(() => vi.fn());
vi.mock('@/server/auth/session', () => ({ getSession }));

import { assertAdmin, isAdmin } from '@/server/auth/permissions';

const asRole = (role: 'admin' | 'coc' | 'nso') =>
  getSession.mockResolvedValue({ user: { id: 'u1', name: 'U', role } });

describe('isAdmin', () => {
  beforeEach(() => getSession.mockReset());

  it('is true for admins', async () => {
    asRole('admin');
    expect(await isAdmin()).toBe(true);
  });

  it.each(['coc', 'nso'] as const)('is false for %s users', async (role) => {
    asRole(role);
    expect(await isAdmin()).toBe(false);
  });
});

describe('assertAdmin', () => {
  beforeEach(() => getSession.mockReset());

  it('does nothing for admins', async () => {
    asRole('admin');
    await expect(assertAdmin()).resolves.toBeUndefined();
  });

  it('throws a default message for non-admins', async () => {
    asRole('coc');
    await expect(assertAdmin()).rejects.toThrow(
      'You do not have permission to do this.',
    );
  });

  it('throws the given message for non-admins', async () => {
    asRole('nso');
    await expect(assertAdmin('No resources for you.')).rejects.toThrow(
      'No resources for you.',
    );
  });
});
