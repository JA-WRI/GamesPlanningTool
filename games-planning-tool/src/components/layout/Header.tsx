//No substnatial AI generated code
import Image from 'next/image';
import GamesSelector from './GamesSelector';
import NsoSelector from './NsoSelector';
import UserSwitcher from './UserSwitcher';
import { AppUser, GameWithNsos } from '@/lib/types';
import { Suspense } from 'react';

export default function Header({
  user,
  users,
  games,
}: {
  user: AppUser;
  users: AppUser[];
  games: GameWithNsos[];
}) {
  const { role } = user;
  const showNsos = role === 'coc' || role === 'admin';

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
            <Suspense>
              <GamesSelector role={role} games={games} />
            </Suspense>
            {showNsos && (
              <Suspense>
                <NsoSelector games={games} />
              </Suspense>
            )}
          </div>
        </div>
        <UserSwitcher user={user} users={users} />
      </div>
    </div>
  );
}
