//More than 50% AI generated to create temporaring sessions for the 3 users
// TEMPORARY dev "session" cookie, until real auth exists.
// purpose: this is a prototype and anyone may switch roles.
// Holds the picked user's id plus their role/NSO, so proxy.ts can block routes
// without a DB call. getSession() still loads the user from the DB by id.
import type { Role } from '@/lib/types';

export const DEV_USER_COOKIE = 'dev-user';

export type DevCookie = { id: string; role: Role; nsoId?: string };

const ROLES: Role[] = ['admin', 'coc', 'nso'];

// Format: "<userId>|<role>|<nsoId or empty>" (uuids and roles never contain '|').
export function serializeDevCookie({ id, role, nsoId }: DevCookie) {
  return [id, role, nsoId ?? ''].join('|');
}

export function parseDevCookie(value?: string): DevCookie | undefined {
  const [id, role, nsoId] = value?.split('|') ?? [];
  if (!id || !ROLES.includes(role as Role)) return undefined;
  return { id, role: role as Role, nsoId: nsoId || undefined };
}
