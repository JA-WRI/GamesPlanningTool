//No substatial AI generated Code
'use client';
import {
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
} from 'next/navigation';
import { findGame, nsoSwitchHref } from '@/lib/routing/Navigation';
import { GameWithNsos } from '@/lib/types';

export default function NsoSelector({ games }: { games: GameWithNsos[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams<{ gameId?: string; nsoId?: string }>();

  const game = findGame(games, params.gameId);
  if (!params.gameId || !game) return null; //for the admin pages

  const nsos = game.nsos;
  const picked = params.nsoId ?? searchParams.get('nso');
  // Ignore a stale/invalid ?nso= that isn't part of this game.
  const selected = nsos.some((n) => n.id === picked) ? picked! : '';

  function handleChange(newNsoId: string) {
    router.push(
      nsoSwitchHref({
        pathname,
        gameId: params.gameId!,
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
      disabled={nsos.length === 0}
      className="rounded-full bg-white px-6 p-2 pr-5 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-burgundy"
    >
      {!selected && (
        <option value="" disabled>
          {nsos.length ? 'Select NSO' : 'No NSOs in this game'}
        </option>
      )}
      {nsos.map((nso) => (
        <option key={nso.id} value={nso.id}>
          {nso.name}
        </option>
      ))}
    </select>
  );
}
