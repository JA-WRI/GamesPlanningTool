//50% or more AI generated
'use client';

import { useEffect, useState, useTransition } from 'react';
import { deleteGame } from '@/features/system-settings/actions/deleteGame';

export default function DeleteGameModal({
  gameId,
  gameName,
  open,
  onClose,
}: {
  gameId: number;
  gameName: string;
  open: boolean;
  onClose: () => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const close = () => {
    if (isPending) return;
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

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      try {
        const result = await deleteGame(gameId);
        if (result.ok) onClose();
        else setError(result.error);
      } catch (err) {
        console.error('deleteGame failed:', err);
        setError('Could not delete the game. Please try again.');
      }
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={close}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-game-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl ring-1 ring-black/5"
      >
        <h2
          id="delete-game-title"
          className="text-xl font-semibold text-gray-900"
        >
          Delete game?
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium">{gameName}</span> will be permanently
          deleted. This can&apos;t be undone.
        </p>

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
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            className="rounded-lg bg-red-600 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
          >
            {isPending ? 'Deleting…' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
