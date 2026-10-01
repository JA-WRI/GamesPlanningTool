'use client';
import React from 'react';
import { Games } from '@/lib/data';
import { Role } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';
import { gameSwitchHref } from '@/lib/routing/navigation';

export default function GamesSelector({ role }: { role: Role }) {
  const router = useRouter();
  const params = useParams<{ gameId?: string; nsoId?: string }>();

  function handleChange(newGameId: string) {
    router.push(gameSwitchHref(newGameId, role, params.nsoId));
  }

  return (
    <select
      value={params.gameId ?? ''}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Select game"
      className="rounded-full bg-white px-6 p-2 pr-5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-[#870606]"
    >
      {!params.gameId && (
        <option value="" disabled>
          Select game
        </option>
      )}
      {Games.map((game) => (
        <option key={game.id} value={game.id}>
          {game.name}
        </option>
      ))}
    </select>
  );
}
