//More than 50% AI generated code to build the Role switcher
'use client';
// TEMPORARY: lets us view the app as each role until real auth exists.
import { useTransition } from 'react';
import { switchRole } from '@/lib/actions/devSession';
import type { AppUser, Role } from '@/lib/types';

const ROLES: { role: Role; label: string }[] = [
  { role: 'admin', label: 'Admin' },
  { role: 'coc', label: 'COC' },
  { role: 'nso', label: 'NSO' },
];

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

export default function UserSwitcher({
  user,
  availableRoles,
}: {
  user: AppUser;
  availableRoles: Role[]; // roles with at least one active user
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end gap-1 text-sm">
        <div className="font-bold text-white">{user.name}</div>
        <div
          role="group"
          aria-label="View as role"
          className="flex rounded-full bg-white/20 p-0.5"
        >
          {ROLES.map(({ role, label }) => {
            const available = availableRoles.includes(role);
            const active = user.role === role;
            return (
              <button
                key={role}
                type="button"
                aria-pressed={active}
                disabled={!available || pending}
                onClick={() => {
                  if (available && !active) {
                    startTransition(() => switchRole(role));
                  }
                }}
                className={`rounded-full px-3 py-0.5 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 disabled:cursor-not-allowed disabled:opacity-50 ${
                  active
                    ? 'bg-white text-burgundy'
                    : 'text-white hover:bg-white/20'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div
        aria-hidden="true"
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold"
      >
        {initials(user.name)}
      </div>
    </div>
  );
}
