//50% or more AI generated
'use server';

import { revalidatePath } from 'next/cache';
import { updateGameActive } from '@/server/queries/games';

export type SetGameActiveResult = { ok: true } | { ok: false; error: string };

export async function setGameActive(
  id: number,
  isActive: boolean,
): Promise<SetGameActiveResult> {
  // TODO: check on the server that the caller is a COC/Admin user.
  if (!Number.isInteger(id) || typeof isActive !== 'boolean') {
    return { ok: false, error: 'Invalid request.' };
  }

  try {
    await updateGameActive(id, isActive);
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === 'P2025') {
      revalidatePath('/', 'layout');
      return { ok: false, error: 'This game no longer exists.' };
    }
    console.error('setGameActive failed:', error);
    return { ok: false, error: 'Could not update the game. Please try again.' };
  }

  revalidatePath('/', 'layout');
  return { ok: true };
}
