//50% or more AI generated
'use client';

import { useEffect, useState, useTransition } from 'react';
import { createGame } from '@/features/system-settings/actions/createGame';

const inputClass =
  'w-full rounded-lg border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition focus:border-[#B5650D] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#B5650D]/20 disabled:opacity-60';

export default function NewGamePopup({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    if (isPending) return;
    setName('');
    setCountry('');
    setCity('');
    setError(null);
    onClose();
  };

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isPending) close();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createGame({ name, country, city });
      if (result.ok) close();
      else setError(result.error);
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-game-title"
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
      >
        <div className="mb-5">
          <h2
            id="new-game-title"
            className="text-xl font-semibold text-gray-900"
          >
            Create a New Game
          </h2>
        </div>

        <div className="space-y-4">
          <div>
            <input
              id="game-name"
              autoFocus
              className={inputClass}
              placeholder="Enter Game Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <input
              id="game-country"
              className={inputClass}
              placeholder="Country"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              disabled={isPending}
            />
          </div>

          <div>
            <input
              id="game-city"
              className={inputClass}
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={isPending}
            />
          </div>
        </div>

        {error && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700"
          >
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={isPending}
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-[#B5650D] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#9A540A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B5650D]/40 focus-visible:ring-offset-2 disabled:opacity-60"
          >
            {isPending ? 'Creating…' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}
