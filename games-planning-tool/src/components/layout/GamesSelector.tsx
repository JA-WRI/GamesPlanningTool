'use client';
import React from 'react';
import { Games } from '@/lib/data';
import { Role } from '@/lib/types';
import { useRouter, useParams } from 'next/navigation';

export default function GamesSelector({ role }: { role: Role }) {
  const router = useRouter();
  const params = useParams<{ gameId?: string; nsoId?: string }>();
  function handleChange(newGameId: string) {
    //when NSO changes games they will be redirected to own dashboard.
    // When COC/Admin change games they will be redirected to their own dashabord.
    router.push(
      role === 'nso' && params.nsoId
        ? `/${newGameId}/${params.nsoId}/dashboard`
        : `/${newGameId}/dashboard`,
    );
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
