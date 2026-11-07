import 'server-only';
import { cache } from 'react';
import { prisma } from '@/lib/prisma';
import type { Role as DbRole } from '@/generated/prisma/enums';
import type { AppUser, Role } from '@/lib/types';

// The DB enum is Admin/COC/NSO; the app uses lowercase roles.
const ROLE_MAP: Record<DbRole, Role> = {
  Admin: 'admin',
  COC: 'coc',
  NSO: 'nso',
};

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  role: true,
  nsoId: true,
  nso: { select: { name: true } },
} as const;

type UserRow = {
  id: string;
  firstName: string;
  lastName: string;
  role: DbRole;
  nsoId: string | null;
  nso: { name: string } | null;
};

function toAppUser(u: UserRow): AppUser {
  return {
    id: u.id,
    name: `${u.firstName} ${u.lastName}`,
    role: ROLE_MAP[u.role],
    nsoId: u.nsoId ?? undefined,
    nsoName: u.nso?.name,
  };
}

// Active users, for the dev user switcher (until real auth exists).
export const getActiveUsers = cache(async (): Promise<AppUser[]> => {
  const rows = await prisma.user.findMany({
    where: { status: 'active' },
    select: userSelect,
    orderBy: [{ role: 'asc' }, { lastName: 'asc' }],
  });
  return rows.map(toAppUser);
});
