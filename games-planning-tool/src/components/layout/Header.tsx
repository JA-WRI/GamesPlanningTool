//No substantial AI generated Code
import Image from 'next/image';
import GamesSelector from './GamesSelector';
import NsoSelector from './NsoSelector';
import DevUserToggle from './DevUserToggle';
import type { GameWithNsos } from '@/lib/types';
import type { SessionUser } from '@/server/auth/session';
import { Suspense } from 'react';

const ROLE_LABELS = { admin: 'Admin', coc: 'COC', nso: 'NSO' } as const;

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Header({
  user,
  games,
  devUsers,
}: {
  user: SessionUser;
  games: GameWithNsos[];
  devUsers: SessionUser[]; // temporary: remove with the toggle later
}) {
  const { role } = user;
  return (
    <div className="flex items-center justify-between bg-terracotta p-3">
      <div className="page-container justify-between flex items-center">
        <div className="flex items-center">
          <div className="flex items-center gap-5">
            <Image
              src="/Team-Canada-logo.png"
              alt="team canada logo"
              width={30}
              height={30}
              className="gap-2 w-auto"
            />
            <div className="text-xl font-bold text-white lg:pr-10 2xl:pr-15">
              Games Planning Tool
            </div>
          </div>
          <div className="flex gap-8">
            <GamesSelector role={role} games={games} />
            {(role === 'coc' || role === 'admin') && (
              <Suspense>
                <NsoSelector games={games} />
              </Suspense>
            )}
          </div>
        </div>
        <div className="flex items-center gap-8">
          {/* temporary: remove the toggle once real authentication is implemented */}
          <DevUserToggle users={devUsers} currentUserId={user.id} />
          <div className="text-center text-sm">
            <div className="font-bold text-white">{user.name}</div>
            <div className="text-xs text-gray-300">{ROLE_LABELS[role]}</div>
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-full bg-white font-bold">
            {initials(user.name)}
          </button>
        </div>
      </div>
    </div>
  );
}
