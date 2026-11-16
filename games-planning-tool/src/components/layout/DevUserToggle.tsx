//no substantial AI generated code
//delete this component once real authentication is implemented.
'use client';
import { useTransition } from 'react';
import type { SessionUser } from '@/server/auth/session';
import { switchDevUser } from '@/server/auth/dev-actions';

export default function DevUserToggle({
  users,
  currentUserId,
}: {
  users: SessionUser[];
  currentUserId: string;
}) {
  const [isPending, startTransition] = useTransition();

  if (users.length === 0) return null;

  return (
    <select
      value={currentUserId}
      disabled={isPending}
      onChange={(e) => {
        const id = e.target.value;
        startTransition(() => switchDevUser(id));
      }}
      aria-label="Switch user"
      className="rounded-full bg-white px-6 p-2 pr-5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy disabled:opacity-60"
    >
      {users.map((u) => (
        <option key={u.id} value={u.id}>
          {u.name} ({u.role.toUpperCase()})
        </option>
      ))}
    </select>
  );
}
