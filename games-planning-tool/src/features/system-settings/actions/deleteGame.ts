//50% or more AI generated
'use server';

import { revalidatePath } from 'next/cache';
import { assertAdmin } from '@/server/auth/permissions';
import { removeGame } from '@/server/queries/games';

export type DeleteGameResult = { ok: true } | { ok: false; error: string };

export async function deleteGame(id: number): Promise<DeleteGameResult> {
  // Only admins manage games. Checked here because actions can be called directly.
  await assertAdmin('Only admins can manage games.');
  if (!Number.isInteger(id)) return { ok: false, error: 'Invalid game.' };

  try {
    await removeGame(id);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    // P2025: the game is already gone (e.g. deleted in another tab). That's the
    // outcome we wanted, so fall through and treat it as success.
    if (code === 'P2003') {
      return {
        ok: false,
        error:
          'This game has NSOs, members, contacts or other data linked to it, so it cannot be deleted.',
      };
    }
    if (code !== 'P2025') {
      console.error('deleteGame failed:', error);
      return {
        ok: false,
        error: 'Could not delete the game. Please try again.',
      };
    }
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
