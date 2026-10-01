'use client';
import React from 'react';
import { Nsos } from '@/lib/data';
import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { nsoSwitchHref } from '@/lib/routing/navigation';

export default function NsoSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ gameId: string; nsoId?: string }>();

  if (!params.gameId) return null; //for the admin pages

  const selected = params.nsoId ?? searchParams.get('nso') ?? '';

  function handleChange(newNsoId: string) {
    router.push(
      nsoSwitchHref({
        pathname,
        gameId: params.gameId,
        nsoId: params.nsoId,
        newNso: newNsoId,
      }),
    );
  }

  return (
    <select
      value={selected}
      onChange={(e) => handleChange(e.target.value)}
      aria-label="Select Nso"
      className="rounded-full bg-white px-6 p-2 pr-5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy"
    >
      {!params.nsoId && (
        <option value="" disabled>
          Select NSO
        </option>
      )}
      {Nsos.map((nso) => (
        <option key={nso.id} value={nso.id}>
          {nso.name}
        </option>
      ))}
    </select>
  );
}
