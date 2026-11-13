// no substantial AI generated code
// everything in this file is a stand-in until real authentication is implemented.
// Keep the `getSession()` export and the `Session` shape so callers don't change, but replace the cookie + "pick a DB user" logic with the auth
// provider's session lookup. Delete DEV_USER_COOKIE and listDevUsers at that point.
import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import type { Role } from '@/lib/types';
import { Role as DbRole } from '@/generated/prisma/enums';

export type SessionUser = {
  id: string;
  name: string;
  role: Role;
  nsoId?: string; // only ever set for role === 'nso'
};

export type Session = { user: SessionUser };

const ROLE_FROM_DB: Record<DbRole, Role> = {
  [DbRole.Admin]: 'admin',
  [DbRole.COC]: 'coc',
  [DbRole.NSO]: 'nso',
};

// TEMP DEV AUTH: cookie holding the user picked in the header's DevUserToggle.
export const DEV_USER_COOKIE = 'dev-user-id';

// TEMP DEV AUTH: used when the users table is empty (e.g. e2e/CI databases).
const FALLBACK_USER: SessionUser = {
  id: 'dev-admin',
  name: 'Dev Admin',
  role: 'admin',
};

// TEMP DEV AUTH: every active user, so the header toggle can switch between them.
export const listDevUsers = cache(async (): Promise<SessionUser[]> => {
  const rows = await prisma.user.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      role: true,
      nsoId: true,
    },
    orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
  });
  return rows.map((u) => ({
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    role: ROLE_FROM_DB[u.role],
    nsoId: u.nsoId ?? undefined,
  }));
});

// TODO(auth): replace the body with the real session lookup.
// Cached per request, so layouts, pages and actions share one lookup.
export const getSession = cache(async (): Promise<Session> => {
  const [cookieStore, users] = await Promise.all([cookies(), listDevUsers()]);
  const selectedId = cookieStore.get(DEV_USER_COOKIE)?.value;

  const user =
    users.find((u) => u.id === selectedId) ??
    users.find((u) => u.role === 'admin') ??
    users[0] ??
    FALLBACK_USER;

  return { user };
});
